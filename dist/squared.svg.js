/* squared.svg 2.5.10
   https://github.com/anpham6/squared */

this.squared = this.squared || {};
this.squared.svg = (function (exports) {
    'use strict';

    var Pattern$2 = squared.lib.base.Pattern;
    const { TRANSFORM: REGEXP_TRANSFORM } = squared.lib.regex;
    const { CSS_PROPERTIES, calculateStyle: calculateCssStyle, calculateVar, calculateVarAsString, convertAngle, getFontSize: getFontSize$3, getStyle, hasEm: hasEm$3, isLength: isLength$3, isPercent: isPercent$2, parseUnit: parseUnit$3 } = squared.lib.css;
    const { getNamedItem: getNamedItem$a } = squared.lib.dom;
    const { convertRadian, hypotenuse, truncateFraction: truncateFraction$3, truncateTrailingZero } = squared.lib.math;
    const { getElementCache } = squared.lib.session;
    const { convertCamelCase: convertCamelCase$2, convertPercent: convertPercent$4, endsWith, resolvePath: resolvePath$1, splitPair: splitPair$1, startsWith: startsWith$2 } = squared.lib.util;
    const RE_PARSE = new Pattern$2(/(\w+)\([^)]+\)/g);
    const RE_ROTATE = new Pattern$2(/rotate\((-?[\d.]+)(?:\s*,?\s+(-?[\d.]+))?(?:\s*,?\s+(-?[\d.]+))?\)/g);
    const REGEXP_TRUNCATECACHE = new Map();
    function setOriginPosition(element, point, attr, value, dimension) {
        if (isLength$3(value)) {
            point[attr] = parseUnit$3(value, createParseUnitOptions(element, value));
        }
        else if (isPercent$2(value)) {
            point[attr] = convertPercent$4(value) * dimension;
        }
    }
    function getDataSetValue(element, attr) {
        var _a;
        const data = element.dataset.baseValue;
        if (data) {
            try {
                const obj = JSON.parse(data);
                if (obj) {
                    return ((_a = obj[attr]) === null || _a === void 0 ? void 0 : _a.toString().trim()) || '';
                }
            }
            catch (_b) {
            }
        }
        return '';
    }
    function getStyleValue(element, attr) {
        const styleMap = getElementCache(element, 'styleMap');
        return styleMap && styleMap[convertCamelCase$2(attr)];
    }
    function getDataValue(element, attr) {
        const attrStyle = convertCamelCase$2(attr);
        return getDataSetValue(element, attr) || element.style[attrStyle] || getStyleValue(element, attrStyle);
    }
    const getViewportArea = (viewBox, min) => min ? Math.min(viewBox.width, viewBox.height) : hypotenuse(viewBox.width, viewBox.height);
    const createParseUnitOptions = (element, value) => hasEm$3(value) ? { fontSize: getFontSize$3(element) } : undefined;
    Object.assign(CSS_PROPERTIES, {
        alignmentBaseline: {
            trait: 0,
            value: 'auto'
        },
        baselineShift: {
            trait: 1 /* CALC */ | 256 /* UNIT */,
            value: '0'
        },
        clipRule: {
            trait: 0,
            value: 'nonzero'
        },
        colorInterpolation: {
            trait: 0,
            value: 'sRGB'
        },
        colorIinterpolationFilters: {
            trait: 0,
            value: 'linearRGB'
        },
        cx: {
            trait: 1 /* CALC */ | 256 /* UNIT */,
            value: '0'
        },
        cy: {
            trait: 1 /* CALC */ | 256 /* UNIT */,
            value: '0'
        },
        dominantBaseline: {
            trait: 0,
            value: 'auto'
        },
        fill: {
            trait: 1 /* CALC */ | 16 /* COLOR */,
            value: 'black'
        },
        fillOpacity: {
            trait: 1 /* CALC */,
            value: '1'
        },
        fillRule: {
            trait: 0,
            value: 'nonzero'
        },
        floodColor: {
            trait: 1 /* CALC */ | 16 /* COLOR */,
            value: 'black'
        },
        floodOpacity: {
            trait: 1 /* CALC */,
            value: '1'
        },
        lightingColor: {
            trait: 1 /* CALC */ | 16 /* COLOR */,
            value: 'white'
        },
        markerEnd: {
            trait: 0,
            value: 'none'
        },
        markerMid: {
            trait: 0,
            value: 'none'
        },
        markerStart: {
            trait: 0,
            value: 'none'
        },
        mask: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 64 /* NONE */,
            value: [
                'maskImage',
                'maskMode',
                'maskRepeat',
                'maskPosition',
                'maskClip',
                'maskOrigin',
                'maskSize',
                'maskComposite'
            ]
        },
        maskComposite: {
            trait: 0,
            value: 'add'
        },
        maskClip: {
            trait: 0,
            value: 'border-box'
        },
        maskImage: {
            trait: 1 /* CALC */,
            value: 'none'
        },
        maskMode: {
            trait: 0,
            value: 'match-source'
        },
        maskRepeat: {
            trait: 0,
            value: 'no-repeat'
        },
        maskOrigin: {
            trait: 0,
            value: 'border-box'
        },
        maskPosition: {
            trait: 1 /* CALC */,
            value: 'center'
        },
        maskSize: {
            trait: 1 /* CALC */,
            value: 'auto'
        },
        pointerEvents: {
            trait: 0,
            value: 'visiblePainted'
        },
        r: {
            trait: 1 /* CALC */ | 256 /* UNIT */,
            value: '0'
        },
        rx: {
            trait: 1 /* CALC */ | 256 /* UNIT */,
            value: 'auto'
        },
        ry: {
            trait: 1 /* CALC */ | 256 /* UNIT */,
            value: 'auto'
        },
        shapeRendering: {
            trait: 0,
            value: 'auto'
        },
        stopColor: {
            trait: 1 /* CALC */ | 16 /* COLOR */,
            value: 'black'
        },
        stopOpacity: {
            trait: 1 /* CALC */,
            value: '1'
        },
        stroke: {
            trait: 1 /* CALC */ | 16 /* COLOR */,
            value: 'none'
        },
        strokeDasharray: {
            trait: 0,
            value: 'none'
        },
        strokeDashoffset: {
            trait: 1 /* CALC */,
            value: '0'
        },
        strokeLinecap: {
            trait: 0,
            value: 'butt'
        },
        strokeLinejoin: {
            trait: 0,
            value: 'miter'
        },
        strokeMiterlimit: {
            trait: 1 /* CALC */,
            value: '4'
        },
        strokeOpacity: {
            trait: 1 /* CALC */,
            value: '1'
        },
        strokeWidth: {
            trait: 1 /* CALC */ | 256 /* UNIT */,
            value: '1px'
        },
        textAnchor: {
            trait: 0,
            value: 'start'
        },
        textRendering: {
            trait: 0,
            value: 'auto'
        },
        vectorEffect: {
            trait: 0,
            value: 'none'
        },
        x: {
            trait: 1 /* CALC */ | 256 /* UNIT */,
            value: '0'
        },
        y: {
            trait: 1 /* CALC */ | 256 /* UNIT */,
            value: '0'
        }
    });
    const CACHE_VIEWNAME = new Map();
    const PATTERN_CUBICBEZIER = '([01](?:\\.\\d+)?)\\s*,?\\s+(-?\\d+(?:\\.\\d+)?)\\s*,?\\s+([01](?:\\.\\d+)?)\\s*,?\\s+(-?\\d+(?:\\.\\d+)?)';
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
            switch (element.tagName) {
                case 'path':
                case 'line':
                case 'rect':
                case 'ellipse':
                case 'circle':
                case 'polyline':
                case 'polygon':
                    return true;
                default:
                    return false;
            }
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
        parse(element, value = getDataValue(element, 'transform')) {
            if (value && value !== 'none') {
                const result = [];
                RE_PARSE.matcher(value);
                while (RE_PARSE.find()) {
                    const [transform, method] = RE_PARSE.groups();
                    if (startsWith$2(method, 'matrix')) {
                        const matrix = TRANSFORM.matrix(element, transform);
                        if (matrix) {
                            result.push(TRANSFORM.create(SVGTransform.SVG_TRANSFORM_MATRIX, matrix));
                        }
                    }
                    else if (!endsWith(method, '3d')) {
                        const isX = endsWith(method, 'X');
                        const isY = !isX && endsWith(method, 'Y');
                        if (startsWith$2(method, 'translate')) {
                            const translate = REGEXP_TRANSFORM.TRANSLATE.exec(transform);
                            if (translate) {
                                const arg1 = parseUnit$3(translate[2], createParseUnitOptions(element, translate[2]));
                                const arg2 = !isX && translate[3] ? parseUnit$3(translate[3], createParseUnitOptions(element, translate[3])) : 0;
                                const x = isY ? 0 : arg1;
                                const y = isY ? arg1 : arg2;
                                result.push(TRANSFORM.create(SVGTransform.SVG_TRANSFORM_TRANSLATE, MATRIX.translate(x, y), 0));
                            }
                        }
                        else if (startsWith$2(method, 'rotate')) {
                            const rotate = REGEXP_TRANSFORM.ROTATE.exec(transform);
                            if (rotate) {
                                const angle = convertAngle(rotate[5], rotate[6]);
                                if (!isNaN(angle)) {
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
                                    result.push(TRANSFORM.create(SVGTransform.SVG_TRANSFORM_ROTATE, matrix, angle, !isX, !isY));
                                }
                            }
                        }
                        else if (startsWith$2(method, 'scale')) {
                            const scale = REGEXP_TRANSFORM.SCALE.exec(transform);
                            if (scale) {
                                const x = isY ? 1 : +scale[2];
                                const y = isX ? 1 : isY ? +scale[2] : !isX && scale[3] ? +scale[3] : x;
                                result.push(TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SCALE, MATRIX.scale(x, y), 0, !isY, !isX));
                            }
                        }
                        else if (startsWith$2(method, 'skew')) {
                            const skew = REGEXP_TRANSFORM.SKEW.exec(transform);
                            if (skew) {
                                const angle = convertAngle(skew[2], skew[3], 0);
                                const x = isY ? 0 : angle;
                                const y = isY ? angle : skew[4] && skew[5] ? convertAngle(skew[4], skew[5], 0) : 0;
                                const matrix = MATRIX.skew(x, y);
                                if (isX) {
                                    result.push(TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SKEWX, matrix, x, true, false));
                                }
                                else if (isY) {
                                    result.push(TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SKEWY, matrix, y, false, true));
                                }
                                else {
                                    result.push(TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SKEWX, Object.assign(Object.assign({}, matrix), { b: 0 }), x, true, false));
                                    if (y !== 0) {
                                        result.push(TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SKEWY, Object.assign(Object.assign({}, matrix), { c: 0 }), y, false, true));
                                    }
                                }
                            }
                        }
                    }
                }
                const length = result.length;
                if (length) {
                    for (let i = 0; i < length; ++i) {
                        result[i].fromStyle = true;
                    }
                    return result;
                }
            }
            return null;
        },
        matrix(element, value = getAttribute(element, 'transform')) {
            const match = REGEXP_TRANSFORM.MATRIX.exec(value);
            if (match) {
                switch (match[1]) {
                    case 'matrix':
                        return {
                            a: +match[2],
                            b: +match[3],
                            c: +match[4],
                            d: +match[5],
                            e: +match[6],
                            f: +match[7]
                        };
                    case 'matrix3d':
                        return {
                            a: +match[2],
                            b: +match[3],
                            c: +match[6],
                            d: +match[7],
                            e: +match[14],
                            f: +match[15]
                        };
                }
            }
            return null;
        },
        origin(element, value) {
            const result = { x: 0, y: 0 };
            if (value || (value = getAttribute(element, 'transform-origin'))) {
                const viewBox = getNearestViewBox$1(element);
                let width = 0, height = 0;
                if (viewBox) {
                    ({ width, height } = viewBox);
                }
                else {
                    const parentElement = element.parentElement;
                    if (parentElement instanceof SVGGraphicsElement) {
                        const viewportElement = parentElement.viewportElement;
                        if (viewportElement && (SVG.svg(viewportElement) || SVG.symbol(viewportElement))) {
                            ({ width, height } = viewportElement.viewBox.baseVal);
                        }
                    }
                }
                if (!width || !height) {
                    ({ width, height } = element.getBoundingClientRect());
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
                        setOriginPosition(element, result, 'x', positions[0], width);
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
                        setOriginPosition(element, result, 'y', positions[1], height);
                        break;
                }
            }
            return result;
        },
        rotateOrigin(element, attr = 'transform') {
            const value = getNamedItem$a(element, attr);
            const result = [];
            if (value) {
                RE_ROTATE.matcher(value);
                while (RE_ROTATE.find()) {
                    const [angle, x, y] = RE_ROTATE.map(group => +group || 0, 1);
                    if (angle !== 0) {
                        result.push({ angle, x, y });
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
    function getDOMRect(element) {
        const result = element.getBoundingClientRect();
        result.x = result.left;
        result.y = result.top;
        return result;
    }
    function calculateStyle(element, attr, value) {
        switch (attr) {
            case 'animationDelay':
            case 'animationDuration':
            case 'animationIterationCount':
            case 'offsetDistance':
            case 'offsetRotate':
            case 'mask':
                return calculateCssStyle(element, attr, value);
            case 'fill':
            case 'stroke':
            case 'stopColor':
            case 'floodColor':
            case 'lightingColor':
                return calculateCssStyle(element, 'fontColor', value);
            case 'fillOpacity':
            case 'strokeOpacity':
            case 'stopOpacity':
            case 'floodOpacity':
                return calculateCssStyle(element, 'opacity', value);
            case 'strokeMiterlimit': {
                const result = calculateVar(element, value, { supportPercent: false, unitType: 32 /* DECIMAL */, min: 1 });
                return !isNaN(result) ? result.toString() : '';
            }
        }
        const viewBox = getNearestViewBox$1(element) || (element.viewportElement || element.parentElement || element).getBoundingClientRect();
        switch (attr) {
            case 'transform':
            case 'transformOrigin':
            case 'offsetAnchor':
            case 'offsetPath':
            case 'clipPath':
            case 'maskImage':
            case 'maskPosition':
            case 'maskSize':
            case 'width':
            case 'height':
                return calculateCssStyle(element, attr, value, viewBox);
            case 'baselineShift':
                return calculateCssStyle(element, 'verticalAlign', value, viewBox);
            case 'cx':
            case 'x':
            case 'x1':
            case 'x2': {
                const result = calculateVar(element, value, { boundingSize: viewBox.width });
                return !isNaN(result) ? result.toString() : '';
            }
            case 'cy':
            case 'y':
            case 'y1':
            case 'y2': {
                const result = calculateVar(element, value, { boundingSize: viewBox.height });
                return !isNaN(result) ? result.toString() : '';
            }
            case 'r': {
                const result = calculateVar(element, value, { boundingSize: getViewportArea(viewBox, true), min: 0 });
                return !isNaN(result) ? result.toString() : '0';
            }
            case 'rx': {
                const result = calculateVar(element, value, { boundingSize: viewBox.width, min: 0 });
                return !isNaN(result) ? SVG.rect(element) ? Math.min(result, viewBox.width / 2).toString() : result.toString() : '0';
            }
            case 'ry': {
                const result = calculateVar(element, value, { boundingSize: viewBox.height, min: 0 });
                return !isNaN(result) ? SVG.rect(element) ? Math.min(result, viewBox.height / 2).toString() : result.toString() : '0';
            }
            case 'strokeDasharray':
                return calculateVarAsString(element, value, { boundingSize: getViewportArea(viewBox), min: 0 });
            case 'strokeDashoffset': {
                const result = calculateVar(element, value, { boundingSize: getViewportArea(viewBox, true), unitType: 32 /* DECIMAL */ });
                return !isNaN(result) ? result.toString() : '';
            }
            case 'strokeWidth': {
                const result = calculateVar(element, value, { boundingSize: getViewportArea(viewBox), unitType: 32 /* DECIMAL */, min: 0 });
                return !isNaN(result) ? result.toString() : '';
            }
        }
        return '';
    }
    function getAttribute(element, attr, computed) {
        return getDataValue(element, attr) || getNamedItem$a(element, attr) || (computed || Array.from(element.style).includes(attr)) && getStyle(element).getPropertyValue(attr) || '';
    }
    function getParentAttribute(element, attr, computed) {
        let current = element, value;
        do {
            value = getAttribute(current, attr, computed);
            if (value && value !== 'inherit') {
                break;
            }
            current = current.parentElement;
        } while (current && !(current instanceof HTMLElement));
        return value;
    }
    function getTargetElement(element, rootElement, contentMap) {
        const value = getNamedItem$a(element, 'href') || getNamedItem$a(element, 'xlink:href');
        if (value[0] === '#') {
            const id = value.substring(1);
            if (!rootElement) {
                let parent = element.parentElement;
                rootElement = parent;
                while (parent && !(parent.parentElement instanceof HTMLElement)) {
                    rootElement = parent;
                    parent = parent.parentElement;
                }
            }
            if (rootElement) {
                const elements = rootElement.querySelectorAll('*');
                for (let i = 0, length = elements.length; i < length; ++i) {
                    const target = elements[i];
                    if (target.id === id && target instanceof SVGElement) {
                        return target;
                    }
                }
            }
            const target = document.getElementById(id);
            if (target instanceof SVGElement) {
                return target;
            }
        }
        else if (contentMap) {
            const [href, id] = splitPair$1(value, '#');
            if (href) {
                const content = contentMap[resolvePath$1(href)];
                if (content) {
                    document.body.insertAdjacentHTML('beforeend', content);
                    element = document.body.lastElementChild;
                    if (element instanceof SVGGraphicsElement) {
                        element.style.display = 'none';
                        return element.querySelector(`#${id}`);
                    }
                    else if (element) {
                        document.body.removeChild(element);
                    }
                }
            }
        }
        return null;
    }
    function truncateString(value, precision = 3) {
        let pattern = REGEXP_TRUNCATECACHE.get(precision);
        if (!pattern) {
            pattern = new RegExp(`(-?\\d+\\.\\d{${precision}})(\\d)\\d*`, 'g');
            REGEXP_TRUNCATECACHE.set(precision, pattern);
        }
        let output = value, match;
        while (match = pattern.exec(value)) {
            let trailing = match[1];
            if (+match[2] >= 5) {
                trailing = truncateFraction$3(+trailing + 1 / Math.pow(10, precision)).toString();
            }
            output = output.replace(match[0], truncateTrailingZero(trailing));
        }
        pattern.lastIndex = 0;
        return output;
    }
    function getNearestViewBox$1(element) {
        let current = element.parentElement;
        while (current) {
            if (SVG.svg(current) || SVG.symbol(current)) {
                const viewBox = current.viewBox;
                if (viewBox) {
                    const baseVal = viewBox.baseVal;
                    return baseVal && baseVal.width && baseVal.height ? baseVal : getDOMRect(current);
                }
            }
            current = current.parentElement;
        }
        return null;
    }
    function getRootOffset(element, rootElement) {
        let x = 0, y = 0, parent = element.parentElement;
        while (parent && parent !== rootElement) {
            if (SVG.svg(parent) || SVG.use(parent)) {
                x += parent.x.baseVal.value;
                y += parent.y.baseVal.value;
            }
            parent = parent.parentElement;
        }
        return { x, y };
    }
    function sanitizePath(value) {
        let d = value, pattern = /(\d*)\.(\d+)\.(\d+)/g, match;
        while (match = pattern.exec(d)) {
            let seg;
            if (!match[1]) {
                seg = '.' + match[2] + ' .' + match[3];
            }
            else if (match[3].length >= 2) {
                seg = match[1] + '.' + match[2] + ' .' + match[3];
            }
            else {
                const length = match[2].length;
                seg = match[1] + '.';
                switch (length) {
                    case 1:
                        seg += match[2] + ' .' + match[3];
                        break;
                    default:
                        seg += match[2].substring(0, length - 1) + ' ' + match[2][length - 1] + '.' + match[3];
                        break;
                }
            }
            value = value.replace(match[0], seg + ' ');
        }
        d = value;
        pattern = /(\d)([A-Za-z])/g;
        while (match = pattern.exec(d)) {
            value = value.replace(match[0], match[1] + ' ' + match[2]);
        }
        d = value;
        pattern = /([A-Za-z])\s+(\d)/g;
        while (match = pattern.exec(d)) {
            value = value.replace(match[0], match[1] + match[2]);
        }
        d = value;
        pattern = /([Aa](?:-?[\d.]+[\s,]+){3}\s*)(0|1)(0|1)(-?[\d.]+)/g;
        while (match = pattern.exec(d)) {
            value = value.replace(match[0], match[1] + ' ' + match[2] + ' ' + match[3] + ' ' + match[4]);
        }
        d = value;
        pattern = /((?:-?[\d.]+[\s,]+){3}\s*)0(0|1)(-?[\d.]+)/g;
        while (match = pattern.exec(d)) {
            found: {
                for (let i = pattern.lastIndex - 1; i >= 0; --i) {
                    switch (d[i]) {
                        case 'A':
                        case 'a':
                            value = value.replace(match[0], d[i] + match[1] + ' 0 ' + match[2] + ' ' + match[3]);
                            break found;
                    }
                }
            }
        }
        d = value;
        pattern = /([A-Za-z\s,])(?:(0+)(\d)|(0{2,}))/g;
        while (match = pattern.exec(d)) {
            value = value.replace(match[0], match[1] + ' ' + (match[4] ? '0 '.repeat(match[4].length) : '0 '.repeat(match[2].length) + ' ' + match[3]));
        }
        d = value;
        pattern = /(\d+)-/g;
        while (match = pattern.exec(d)) {
            value = value.replace(match[0], match[1] + ' -');
        }
        return value.replace(/\s{2,}/g, ' ');
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
        __proto__: null,
        CACHE_VIEWNAME: CACHE_VIEWNAME,
        PATTERN_CUBICBEZIER: PATTERN_CUBICBEZIER,
        SVG: SVG,
        MATRIX: MATRIX,
        TRANSFORM: TRANSFORM,
        getDOMRect: getDOMRect,
        calculateStyle: calculateStyle,
        getAttribute: getAttribute,
        getParentAttribute: getParentAttribute,
        getTargetElement: getTargetElement,
        truncateString: truncateString,
        getNearestViewBox: getNearestViewBox$1,
        getRootOffset: getRootOffset,
        sanitizePath: sanitizePath,
        createPath: createPath,
        getPathLength: getPathLength
    });

    var Pattern$1 = squared.lib.base.Pattern;
    const { isAngle: isAngle$1, parseAngle: parseAngle$2 } = squared.lib.css;
    const { getNamedItem: getNamedItem$9 } = squared.lib.dom;
    const { absoluteAngle, offsetAngleY: offsetAngleY$1, relativeAngle: relativeAngle$1, truncate: truncate$1, truncateFraction: truncateFraction$2 } = squared.lib.math;
    const { hasBit, isArray, plainMap: plainMap$3, splitPair } = squared.lib.util;
    const RE_DECIMAL = new Pattern$1(squared.lib.regex.STRING.DECIMAL);
    const RE_PATHCOMMAND = new Pattern$1(/([A-Za-z])([^A-Za-z]+)?/g);
    class SvgBuild {
        static isUse(object) {
            return hasBit(object.instanceType, 1 /* SVG_USE */);
        }
        static isContainer(object) {
            return hasBit(object.instanceType, 2 /* SVG_CONTAINER */);
        }
        static isElement(object) {
            return hasBit(object.instanceType, 4 /* SVG_ELEMENT */);
        }
        static isShape(object) {
            return hasBit(object.instanceType, 2052 /* SVG_SHAPE */);
        }
        static isAnimate(object) {
            return hasBit(object.instanceType, 32776 /* SVG_ANIMATE */);
        }
        static isAnimateTransform(object) {
            return hasBit(object.instanceType, 98312 /* SVG_ANIMATE_TRANSFORM */);
        }
        static asSvg(object) {
            return object.instanceType === 18 /* SVG */;
        }
        static asG(object) {
            return object.instanceType === 34 /* SVG_G */;
        }
        static asPattern(object) {
            return object.instanceType === 258 /* SVG_PATTERN */;
        }
        static asShapePattern(object) {
            return object.instanceType === 514 /* SVG_SHAPE_PATTERN */;
        }
        static asImage(object) {
            return object.instanceType === 8196 /* SVG_IMAGE */;
        }
        static asUseG(object) {
            return object.instanceType === 115 /* SVG_USE_G */;
        }
        static asUseSymbol(object) {
            return object.instanceType === 131 /* SVG_USE_SYMBOL */;
        }
        static asUseShape(object) {
            return object.instanceType === 6149 /* SVG_USE_SHAPE */;
        }
        static asUseShapePattern(object) {
            return object.instanceType === 1539 /* SVG_USE_SHAPE_PATTERN */;
        }
        static asSet(object) {
            return object.instanceType === 8 /* SVG_ANIMATION */;
        }
        static asAnimate(object) {
            return object.instanceType === 32776 /* SVG_ANIMATE */;
        }
        static asAnimateTransform(object) {
            return object.instanceType === 98312 /* SVG_ANIMATE_TRANSFORM */;
        }
        static asAnimateMotion(object) {
            return object.instanceType === 229384 /* SVG_ANIMATE_MOTION */;
        }
        static drawCircle(cx, cy, r, precision) {
            return SvgBuild.drawEllipse(cx, cy, r, r, precision);
        }
        static drawPolygon(values, precision) {
            return values.length > 0 ? SvgBuild.drawPolyline(values, precision) + 'Z' : '';
        }
        static drawLine(x1, y1, x2 = 0, y2 = 0, precision) {
            if (precision) {
                x1 = truncate$1(x1, precision);
                y1 = truncate$1(y1, precision);
                x2 = truncate$1(x2, precision);
                y2 = truncate$1(y2, precision);
            }
            return `M${x1},${y1} L${x2},${y2}`;
        }
        static drawRect(width, height, x = 0, y = 0, precision) {
            if (precision) {
                width = truncate$1(x + width, precision);
                height = truncate$1(y + height, precision);
                x = truncate$1(x, precision);
                y = truncate$1(y, precision);
            }
            else {
                width += x;
                height += y;
            }
            return `M${x},${y} ${width},${y} ${width},${height} ${x},${height}Z`;
        }
        static drawEllipse(cx, cy, rx, ry, precision) {
            if (ry === undefined) {
                ry = rx;
            }
            let radius = rx * 2;
            cx -= rx;
            if (precision) {
                cx = truncate$1(cx, precision);
                cy = truncate$1(cy, precision);
                rx = truncate$1(rx, precision);
                ry = truncate$1(ry, precision);
                radius = truncate$1(radius, precision);
            }
            return `M${cx},${cy} a${rx},${ry},0,0,1,${radius},0 a${rx},${ry},0,0,1,-${radius},0`;
        }
        static drawPolyline(values, precision) {
            let result = 'M';
            const length = values.length;
            if (precision) {
                for (let i = 0; i < length; ++i) {
                    const { x, y } = values[i];
                    result += ' ' + truncate$1(x, precision) + ',' + truncate$1(y, precision);
                }
            }
            else {
                for (let i = 0; i < length; ++i) {
                    const { x, y } = values[i];
                    result += ' ' + x + ',' + y;
                }
            }
            return result;
        }
        static drawPath(values, precision) {
            let result = '';
            for (let i = 0, length = values.length; i < length; ++i) {
                const value = values[i];
                result += i > 0 ? ' ' + value.key : value.key;
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
            return precision ? truncateString(result, precision) : result;
        }
        static drawRefit(element, parent, precision) {
            let value;
            if (SVG.path(element)) {
                value = getNamedItem$9(element, 'd');
                if (parent && parent.requireRefit) {
                    const commands = SvgBuild.toPathCommands(value);
                    if (commands.length) {
                        const points = SvgBuild.toPathPoints(commands);
                        if (points.length) {
                            parent.refitPoints(points);
                            value = SvgBuild.drawPath(SvgBuild.syncPath(commands, points), precision);
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
                let rx, ry;
                if (SVG.ellipse(element)) {
                    rx = element.rx.baseVal.value;
                    ry = element.ry.baseVal.value;
                }
                else {
                    rx = element.r.baseVal.value;
                    ry = rx;
                }
                const points = [{ x: element.cx.baseVal.value, y: element.cy.baseVal.value, rx, ry }];
                if (parent && parent.requireRefit) {
                    parent.refitPoints(points);
                }
                const pt = points[0];
                value = SvgBuild.drawEllipse(pt.x, pt.y, pt.rx, pt.ry, precision);
            }
            else if (SVG.rect(element)) {
                let x = element.x.baseVal.value, y = element.y.baseVal.value, width = element.width.baseVal.value, height = element.height.baseVal.value;
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
            return value || '';
        }
        static transformRefit(value, options) {
            let transforms, parent, container, precision;
            if (options) {
                ({ transforms, parent, container, precision } = options);
            }
            const commands = SvgBuild.toPathCommands(value);
            if (commands.length) {
                let points = SvgBuild.toPathPoints(commands);
                if (points.length) {
                    const transformed = isArray(transforms);
                    if (transformed) {
                        points = SvgBuild.applyTransforms(transforms, points, parent && TRANSFORM.origin(parent.element));
                    }
                    if (container && container.requireRefit) {
                        container.refitPoints(points);
                    }
                    value = SvgBuild.drawPath(SvgBuild.syncPath(commands, points, transformed), precision);
                }
            }
            return value;
        }
        static toOffsetPath(value, rotation = 'auto 0deg') {
            const element = createPath(value);
            const totalLength = Math.ceil(element.getTotalLength());
            const result = [];
            if (totalLength) {
                const keyPoints = [];
                const rotatingPoints = [];
                let rotateFixed = 0, rotateInitial = 0, rotatePrevious = 0, overflow = 0, center = null, rotating;
                if (isAngle$1(rotation)) {
                    rotateFixed = parseAngle$2(rotation, 0);
                }
                else {
                    for (const item of SvgBuild.toPathCommands(value)) {
                        switch (item.key.toUpperCase()) {
                            case 'M':
                            case 'L':
                            case 'H':
                            case 'V':
                            case 'Z':
                                keyPoints.push(...item.value);
                                rotatingPoints.push(...new Array(item.value.length).fill(false));
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
                        rotateInitial = parseAngle$2(rotation.split(' ').pop(), 0);
                    }
                }
                for (let key = 0; key < totalLength; ++key) {
                    const nextPoint = element.getPointAtLength(key);
                    if (keyPoints.length) {
                        const index = keyPoints.findIndex((pt) => {
                            const x = pt.x.toString();
                            const y = pt.y.toString();
                            return x === nextPoint.x.toPrecision(x.length - (x.includes('.') ? 1 : 0)) && y === nextPoint.y.toPrecision(y.length - (y.includes('.') ? 1 : 0));
                        });
                        if (index !== -1) {
                            const endPoint = keyPoints[index + 1];
                            if (endPoint) {
                                if (rotating = rotatingPoints[index + 1]) {
                                    center = SvgBuild.centerOf(keyPoints[index], endPoint);
                                    rotateFixed = 0;
                                }
                                else {
                                    center = null;
                                    rotateFixed = truncateFraction$2(absoluteAngle(nextPoint, endPoint));
                                }
                            }
                            else {
                                center = null;
                            }
                            overflow = 0;
                            keyPoints.splice(0, index + 1);
                            rotatingPoints.splice(0, index + 1);
                        }
                    }
                    let rotate;
                    if (rotating) {
                        rotate = center ? truncateFraction$2(relativeAngle$1(center, nextPoint)) : 0;
                        if (rotatePrevious > 0 && rotatePrevious % 360 === 0 && Math.floor(rotate) === 0) {
                            overflow = rotatePrevious;
                        }
                        rotate += overflow;
                    }
                    else {
                        rotate = rotateFixed;
                    }
                    rotate += rotateInitial;
                    result.push({ key, value: nextPoint, rotate });
                    rotatePrevious = Math.ceil(rotate);
                }
            }
            return result;
        }
        static toPathCommands(value) {
            const result = [];
            let n = 0;
            RE_PATHCOMMAND.matcher(value.trim());
            while (RE_PATHCOMMAND.find()) {
                let key = RE_PATHCOMMAND.group(1);
                if (n === 0 && key.toUpperCase() !== 'M') {
                    break;
                }
                const values = RE_PATHCOMMAND.group(2);
                const coordinates = values ? SvgBuild.parseCoordinates(values.trim()) : [];
                const items = [];
                let length = coordinates.length, previousCommand, previousPoint;
                if (n > 0) {
                    const previous = result[n - 1];
                    previousCommand = previous.key.toUpperCase();
                    previousPoint = previous.end;
                }
                switch (key.toUpperCase()) {
                    case 'M':
                        if (n === 0) {
                            key = 'M';
                        }
                    case 'L':
                        if (length >= 2) {
                            length -= length % 2;
                            items.push(coordinates);
                        }
                        break;
                    case 'H':
                        if (previousPoint) {
                            for (let i = 0; i < length; ++i) {
                                items.push([coordinates[i], key === 'h' ? 0 : previousPoint.y]);
                            }
                        }
                        break;
                    case 'V':
                        if (previousPoint) {
                            for (let i = 0; i < length; ++i) {
                                items.push([key === 'v' ? 0 : previousPoint.x, coordinates[i]]);
                            }
                        }
                        break;
                    case 'Z':
                        if (n > 0) {
                            items.push(result[0].coordinates.slice(0, 2));
                            key = 'Z';
                        }
                        break;
                    case 'C':
                        if (length >= 6) {
                            length -= length % 6;
                            for (let i = 0; i < length; i += 6) {
                                items.push(coordinates.slice(i, i + 6));
                            }
                        }
                        break;
                    case 'S':
                        if (length >= 4 && (previousCommand === 'C' || previousCommand === 'S')) {
                            length -= length % 4;
                            for (let i = 0; i < length; i += 4) {
                                items.push(coordinates.slice(i, i + 4));
                            }
                        }
                        break;
                    case 'Q':
                        if (length >= 4) {
                            length -= length % 4;
                            for (let i = 0; i < length; i += 4) {
                                items.push(coordinates.slice(i, i + 4));
                            }
                        }
                        break;
                    case 'T':
                        if (length >= 2 && (previousCommand === 'Q' || previousCommand === 'T')) {
                            length -= length % 2;
                            for (let i = 0; i < length; i += 2) {
                                items.push(coordinates.slice(i, i + 2));
                            }
                        }
                        break;
                    case 'A':
                        if (length >= 7) {
                            length -= length % 7;
                            for (let i = 0; i < length; i += 7) {
                                items.push(coordinates.slice(i, i + 7));
                            }
                        }
                        break;
                    default:
                        continue;
                }
                for (let i = 0, q = items.length; i < q; ++i) {
                    const item = items[i];
                    const lowerKey = key.toLowerCase();
                    const commandA = lowerKey === 'a' ? item.splice(0, 5) : null;
                    const relative = key === lowerKey;
                    const itemCount = item.length;
                    const points = new Array(itemCount / 2);
                    let k = 0;
                    for (let j = 0; j < itemCount; j += 2) {
                        let x = item[j], y = item[j + 1];
                        if (relative && previousPoint) {
                            x += previousPoint.x;
                            y += previousPoint.y;
                        }
                        points[k++] = { x, y };
                    }
                    const data = {
                        key,
                        value: points,
                        start: points[0],
                        end: points[k - 1],
                        relative,
                        coordinates: item
                    };
                    if (commandA) {
                        data.radiusX = commandA[0];
                        data.radiusY = commandA[1];
                        data.xAxisRotation = commandA[2];
                        data.largeArcFlag = commandA[3];
                        data.sweepFlag = commandA[4];
                    }
                    result.push(data);
                    previousPoint = data.end;
                }
                n = result.length;
            }
            return result;
        }
        static toPathPoints(values) {
            const result = [];
            let x = 0, y = 0;
            for (let i = 0, length = values.length; i < length; ++i) {
                const value = values[i];
                const { key, relative, coordinates } = value;
                for (let j = 0, q = coordinates.length; j < q; j += 2) {
                    if (relative) {
                        x += coordinates[j];
                        y += coordinates[j + 1];
                    }
                    else {
                        x = coordinates[j];
                        y = coordinates[j + 1];
                    }
                    const pt = { x, y };
                    if (key.toUpperCase() === 'A') {
                        pt.rx = value.radiusX;
                        pt.ry = value.radiusY;
                    }
                    result.push(pt);
                }
                if (relative) {
                    value.key = key.toUpperCase();
                }
            }
            return result;
        }
        static syncPath(values, points, transformed) {
            invalid: {
                let location;
                for (let i = 0, length = values.length; i < length; ++i) {
                    const item = values[i];
                    const { key, coordinates, value } = item;
                    if (item.relative) {
                        if (location) {
                            if (transformed && (key === 'H' || key === 'V')) {
                                const pt = points.shift();
                                if (pt) {
                                    coordinates[0] = pt.x;
                                    coordinates[1] = pt.y;
                                    value[0] = pt;
                                    item.key = 'L';
                                    item.relative = false;
                                }
                                else {
                                    break invalid;
                                }
                            }
                            else {
                                const q = coordinates.length;
                                for (let j = 0, k = 0; j < q; j += 2) {
                                    const pt = points.shift();
                                    if (pt) {
                                        coordinates[j] = pt.x - location.x;
                                        coordinates[j + 1] = pt.y - location.y;
                                        if (key === 'a' && pt.rx !== undefined && pt.ry !== undefined) {
                                            item.radiusX = pt.rx;
                                            item.radiusY = pt.ry;
                                        }
                                        value[k++] = pt;
                                        location = pt;
                                    }
                                    else {
                                        break invalid;
                                    }
                                }
                                item.key = key.toLowerCase();
                            }
                        }
                        else {
                            break;
                        }
                    }
                    else {
                        switch (key.toUpperCase()) {
                            case 'M':
                            case 'L':
                            case 'H':
                            case 'V':
                            case 'C':
                            case 'S':
                            case 'Q':
                            case 'T':
                            case 'Z': {
                                const q = coordinates.length;
                                for (let j = 0, k = 0; j < q; j += 2) {
                                    const pt = points.shift();
                                    if (pt) {
                                        coordinates[j] = pt.x;
                                        coordinates[j + 1] = pt.y;
                                        item.value[k++] = pt;
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
                                if (pt) {
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
                    }
                    location = value[value.length - 1];
                    item.start = value[0];
                    item.end = location;
                }
            }
            return values;
        }
        static filterTransforms(transforms, exclude) {
            const result = [];
            for (let i = 0, length = transforms.length; i < length; ++i) {
                const item = transforms[i];
                const type = item.type;
                if (!(exclude && exclude.includes(type))) {
                    switch (type) {
                        case SVGTransform.SVG_TRANSFORM_ROTATE:
                        case SVGTransform.SVG_TRANSFORM_SKEWX:
                        case SVGTransform.SVG_TRANSFORM_SKEWY:
                            if (item.angle === 0) {
                                continue;
                            }
                            break;
                        case SVGTransform.SVG_TRANSFORM_SCALE: {
                            const m = item.matrix;
                            if (m.a === 1 && m.d === 1) {
                                continue;
                            }
                            break;
                        }
                        case SVGTransform.SVG_TRANSFORM_TRANSLATE: {
                            const m = item.matrix;
                            if (m.e === 0 && m.f === 0) {
                                continue;
                            }
                            break;
                        }
                    }
                    result.push(item);
                }
            }
            return result;
        }
        static applyTransforms(transforms, values, origin) {
            const result = SvgBuild.clonePoints(values);
            const length = result.length;
            for (const item of transforms.slice(0).reverse()) {
                const m = item.matrix;
                let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
                if (origin) {
                    const { x, y } = origin;
                    const { x: mX, y: mY } = item.method;
                    switch (item.type) {
                        case SVGTransform.SVG_TRANSFORM_SCALE:
                            if (mX) {
                                x2 = x * (1 - m.a);
                            }
                            if (mY) {
                                y2 = y * (1 - m.d);
                            }
                            break;
                        case SVGTransform.SVG_TRANSFORM_SKEWX:
                            if (mX || mY) {
                                y1 -= y;
                            }
                            break;
                        case SVGTransform.SVG_TRANSFORM_SKEWY:
                            if (mX || mY) {
                                x1 -= x;
                            }
                            break;
                        case SVGTransform.SVG_TRANSFORM_ROTATE:
                            if (mX) {
                                x1 -= x;
                                x2 = x + offsetAngleY$1(item.angle, x);
                            }
                            if (mY) {
                                y1 -= y;
                                y2 = y + offsetAngleY$1(item.angle, y);
                            }
                            break;
                    }
                }
                for (let i = 0; i < length; ++i) {
                    const pt = result[i];
                    const { x, y } = pt;
                    pt.x = MATRIX.applyX(m, x, y + y1) + x2;
                    pt.y = MATRIX.applyY(m, x + x1, y) + y2;
                    if (item.type === SVGTransform.SVG_TRANSFORM_SCALE) {
                        const { rx, ry } = pt;
                        if (rx !== undefined && ry !== undefined) {
                            pt.rx = MATRIX.applyX(m, rx, ry + y1);
                            pt.ry = MATRIX.applyY(m, rx + x1, ry);
                        }
                    }
                }
            }
            return result;
        }
        static convertTransforms(transform) {
            const length = transform.numberOfItems;
            const result = new Array(length);
            for (let i = 0; i < length; ++i) {
                const { type, matrix, angle } = transform.getItem(i);
                result[i] = TRANSFORM.create(type, matrix, angle);
            }
            return result;
        }
        static convertPoints(values) {
            const length = values.length;
            if (length % 2 === 0) {
                const result = new Array(length / 2);
                for (let i = 0, j = 0; i < length; i += 2) {
                    result[j++] = {
                        x: values[i],
                        y: values[i + 1]
                    };
                }
                return result;
            }
            return [];
        }
        static clonePoints(values) {
            if (Array.isArray(values)) {
                const length = values.length;
                const result = new Array(length);
                for (let i = 0; i < length; ++i) {
                    const { x, y, rx, ry } = values[i];
                    const item = { x, y };
                    if (rx !== undefined && ry !== undefined) {
                        item.rx = rx;
                        item.ry = ry;
                    }
                    result[i] = item;
                }
                return result;
            }
            const length = values.numberOfItems;
            const result = new Array(length);
            for (let i = 0; i < length; ++i) {
                const { x, y } = values.getItem(i);
                result[i] = { x, y };
            }
            return result;
        }
        static minMaxOf(values, radius) {
            let { x: minX, y: minY } = values[0], maxX = minX, maxY = minY;
            for (let i = 1, length = values.length; i < length; ++i) {
                const { x, y } = values[i];
                if (radius && i > 0) {
                    const { rx, ry } = values[i];
                    if (rx !== undefined && ry !== undefined) {
                        const { x: x1, y: y1 } = values[i - 1];
                        let x2 = (x + x1) / 2, y2 = (y + y1) / 2;
                        if (x > x1) {
                            y2 -= ry;
                        }
                        else if (x < x1) {
                            y2 += ry;
                        }
                        if (y < y1) {
                            x2 += rx;
                        }
                        else if (y > x1) {
                            x2 -= rx;
                        }
                        minX = Math.min(x2, minX);
                        maxX = Math.max(x2, maxX);
                        minY = Math.min(y2, minY);
                        maxY = Math.max(y2, maxY);
                    }
                }
                if (x < minX) {
                    minX = x;
                }
                else if (x > maxX) {
                    maxX = x;
                }
                if (y < minY) {
                    minY = y;
                }
                else if (y > maxY) {
                    maxY = y;
                }
            }
            return { top: minY, right: maxX, bottom: maxY, left: minX };
        }
        static centerOf(...values) {
            const result = this.minMaxOf(values);
            return { x: (result.left + result.right) / 2, y: (result.top + result.bottom) / 2 };
        }
        static boxRectOf(values) {
            const points = [];
            for (let i = 0, length = values.length; i < length; ++i) {
                points.push(...SvgBuild.toPathPoints(SvgBuild.toPathCommands(values[i])));
            }
            return this.minMaxOf(points, true);
        }
        static parsePoints(value) {
            return plainMap$3(value.trim().split(/\s+/), coords => {
                const [x, y] = splitPair(coords, ',');
                return { x: +x, y: +y };
            });
        }
        static parseCoordinates(value) {
            const result = [];
            if (value) {
                RE_DECIMAL.matcher(value);
                while (RE_DECIMAL.find()) {
                    const coord = +RE_DECIMAL.group();
                    if (!isNaN(coord)) {
                        result.push(coord);
                    }
                }
            }
            return result;
        }
    }

    const { getNamedItem: getNamedItem$8 } = squared.lib.dom;
    function adjustPoints(values, x, y, scaleX, scaleY) {
        for (let i = 0, length = values.length; i < length; ++i) {
            const pt = values[i];
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
                    if (this.verifyBaseValue(attr, value) === 1) {
                        this._baseVal[attr] = value;
                        return true;
                    }
                }
                else {
                    switch (attr) {
                        case 'd':
                            this._baseVal[attr] = getNamedItem$8(this.element, 'd');
                            return true;
                        case 'points': {
                            const points = this.element[attr];
                            if (Array.isArray(points)) {
                                this._baseVal[attr] = SvgBuild.clonePoints(points);
                                return true;
                            }
                            break;
                        }
                        default: {
                            const object = this.element[attr];
                            if (object) {
                                const baseVal = object.baseVal;
                                if (baseVal) {
                                    this._baseVal[attr] = baseVal.value;
                                    return true;
                                }
                            }
                            break;
                        }
                    }
                }
                return false;
            }
            getBaseValue(attr, fallback) {
                var _a;
                return (_a = this._baseVal[attr]) !== null && _a !== void 0 ? _a : (!this.setBaseValue(attr) ? fallback : undefined);
            }
            refitBaseValue(x, y, precision, scaleX = 1, scaleY = 1) {
                const baseVal = this._baseVal;
                for (const attr in baseVal) {
                    const value = baseVal[attr];
                    if (typeof value === 'string') {
                        if (attr === 'd') {
                            const commands = SvgBuild.toPathCommands(value);
                            const points = SvgBuild.toPathPoints(commands);
                            adjustPoints(points, x, y, scaleX, scaleY);
                            baseVal[attr] = SvgBuild.drawPath(SvgBuild.syncPath(commands, points), precision);
                        }
                    }
                    else if (typeof value === 'number') {
                        switch (attr) {
                            case 'cx':
                            case 'x1':
                            case 'x2':
                            case 'x':
                                baseVal[attr] += x;
                                break;
                            case 'cy':
                            case 'y1':
                            case 'y2':
                            case 'y':
                                baseVal[attr] += y;
                                break;
                            case 'r':
                                baseVal[attr] *= Math.min(scaleX, scaleY);
                                break;
                            case 'rx':
                            case 'width':
                                baseVal[attr] *= scaleX;
                                break;
                            case 'ry':
                            case 'height':
                                baseVal[attr] *= scaleY;
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
                        return typeof value === 'string' ? 1 : 0;
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
                        return typeof value === 'number' ? 1 : 0;
                    case 'points':
                        return Array.isArray(value) ? 1 : 0;
                    default:
                        return 2;
                }
            }
        };
    };

    const { getFontSize: getFontSize$2, hasEm: hasEm$2, isLength: isLength$2, parseUnit: parseUnit$2 } = squared.lib.css;
    const { getNamedItem: getNamedItem$7 } = squared.lib.dom;
    const { capitalize, hasValue: hasValue$1, isString } = squared.lib.util;
    const REGEXP_TIME = /^(-)?(\d+(?:\.\d+)?)(ms|s|min|h)?$/;
    const REGGXP_TIMEDELIMITED = /^(-)?(?:(\d+):)?(?:([0-5][0-9]):)?([0-5][0-9])(?:\.(\d{1,3}))?$/;
    function setFillMode(mode, value) {
        const valid = this.fillMode & value;
        if (mode) {
            if (!valid) {
                this.fillMode |= value;
            }
        }
        else if (valid) {
            this.fillMode ^= value;
        }
    }
    class SvgAnimation {
        constructor(element, animationElement) {
            this.element = null;
            this.fillMode = 0;
            this.synchronizeState = 0;
            this.paused = false;
            this.id = null;
            this.baseValue = '';
            this.animationElement = null;
            this.instanceType = 8 /* SVG_ANIMATION */;
            this._to = '';
            this._duration = -1;
            this._delay = 0;
            this._parent = null;
            this._attributeName = '';
            this._dataset = null;
            this._group = null;
            if (element) {
                const dataset = element.dataset;
                for (const name in dataset) {
                    const value = dataset[name];
                    if (isString(value)) {
                        try {
                            (this._dataset || (this._dataset = {}))[name] = JSON.parse(value);
                        }
                        catch (_a) {
                        }
                    }
                }
                this.element = element;
            }
            if (animationElement) {
                this.animationElement = animationElement;
                this.setAttribute('attributeName');
                this.setAttribute('to');
                this.setAttribute('fill', 'freeze');
                const dur = getNamedItem$7(animationElement, 'dur');
                if (dur && dur !== 'indefinite') {
                    const value = SvgAnimation.parseClockTime(dur);
                    this.duration = !isNaN(value) && value > 0 ? value : 0;
                }
            }
        }
        static parseClockTime(value) {
            let match = REGEXP_TIME.exec(value = value.trim());
            if (match) {
                let time = +match[2] * (match[1] ? -1 : 1);
                switch (match[3]) {
                    case 'ms':
                        break;
                    case 'h':
                        time *= 60;
                    case 'min':
                        time *= 60;
                    default:
                        time *= 1000;
                        break;
                }
                return Math.round(time);
            }
            if (match = REGGXP_TIMEDELIMITED.exec(value)) {
                const ms = match[5];
                let time = +match[4] * (match[1] ? -1 : 1);
                if (match[1]) {
                    time += +match[2] * 60 * 60;
                }
                if (match[2]) {
                    time += +match[3] * 60;
                }
                return time * 1000 + (ms ? +ms * (ms.length < 3 ? Math.pow(10, 3 - ms.length) : 1) : 0);
            }
            return NaN;
        }
        setAttribute(attr, equality) {
            const animationElement = this.animationElement;
            if (animationElement) {
                const value = getNamedItem$7(animationElement, attr);
                if (value) {
                    if (isString(equality)) {
                        equality = equality.trim();
                        this[attr + capitalize(equality)] = value === equality;
                    }
                    else {
                        this[attr] = value;
                    }
                }
            }
        }
        addState(...values) {
            for (const value of values) {
                if (~this.synchronizeState & value) {
                    this.synchronizeState |= value;
                }
            }
        }
        removeState(...values) {
            for (const value of values) {
                this.synchronizeState &= ~value;
            }
        }
        hasState(...values) {
            return values.some(value => this.synchronizeState & value);
        }
        set attributeName(value) {
            var _a, _b, _c, _d;
            if (value !== 'transform' && !this.baseValue) {
                let baseValue = (_b = (_a = this._dataset) === null || _a === void 0 ? void 0 : _a.baseValue) === null || _b === void 0 ? void 0 : _b[value];
                if (hasValue$1(baseValue)) {
                    this.baseValue = baseValue.toString().trim();
                }
                else {
                    const element = this.element;
                    if (element) {
                        switch (value) {
                            case 'opacity':
                            case 'stroke-opacity':
                            case 'fill-opacity':
                                baseValue = getAttribute(element, value) || '1';
                                break;
                            default:
                                baseValue = getAttribute(element, value);
                                break;
                        }
                        if (!baseValue) {
                            const animationElement = this.animationElement;
                            if (animationElement && getComputedStyle(element).animationPlayState === 'paused') {
                                const parentElement = animationElement.parentElement;
                                if (parentElement) {
                                    const valueAsString = (_d = (_c = parentElement[value]) === null || _c === void 0 ? void 0 : _c.baseVal) === null || _d === void 0 ? void 0 : _d.valueAsString;
                                    if (valueAsString && isLength$2(valueAsString)) {
                                        this.baseValue = parseUnit$2(valueAsString, hasEm$2(valueAsString) ? { fontSize: getFontSize$2(parentElement) } : undefined).toString();
                                    }
                                }
                            }
                        }
                        else {
                            this.baseValue = baseValue;
                        }
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
            setFillMode.call(this, value, 4 /* BACKWARDS */);
        }
        get fillBackwards() {
            return (this.fillMode & 4 /* BACKWARDS */) > 0;
        }
        set fillForwards(value) {
            setFillMode.call(this, value, 2 /* FORWARDS */);
        }
        get fillForwards() {
            return (this.fillMode & 2 /* FORWARDS */) > 0;
        }
        set fillFreeze(value) {
            setFillMode.call(this, value, 1 /* FREEZE */);
        }
        get fillFreeze() {
            return (this.fillMode & 1 /* FREEZE */) > 0;
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
            return this._group || (this._group = { id: -Infinity, name: '' });
        }
        set setterType(value) { }
        get setterType() { return true; }
        get fillReplace() {
            switch (this.fillMode) {
                case 0:
                case 4 /* BACKWARDS */:
                    return true;
                default:
                    return false;
            }
        }
        get parentContainer() {
            let result = this._parent;
            while (result && !SvgBuild.isContainer(result)) {
                result = result.parent;
            }
            return result;
        }
    }

    const { convertHex, parseColor: parseColor$2 } = squared.lib.color;
    const { getFontSize: getFontSize$1, hasEm: hasEm$1, isLength: isLength$1, parseUnit: parseUnit$1 } = squared.lib.css;
    const { getNamedItem: getNamedItem$6 } = squared.lib.dom;
    const { isNumber: isNumber$3, lastItemOf: lastItemOf$2, replaceMap: replaceMap$2, sortNumber: sortNumber$3, trimEnd } = squared.lib.util;
    const REGEXP_BEZIER = new RegExp(`${PATTERN_CUBICBEZIER}`);
    const REGEXP_BEZIERCSS = new RegExp(`\\bcubic-bezier\\(${PATTERN_CUBICBEZIER}\\)`);
    const invertControlPoint = (value) => +(1 - value).toPrecision(5);
    class SvgAnimate extends SvgAnimation {
        constructor(element, animationElement) {
            super(element, animationElement);
            this.type = 0;
            this.additiveSum = false;
            this.accumulateSum = false;
            this.instanceType = 32776 /* SVG_ANIMATE */;
            this._reverse = false;
            this._alternate = false;
            this._values = null;
            this._keyTimes = null;
            this._keySplines = null;
            this._iterationCount = 1;
            this._from = '';
            this._setterType = false;
            this._repeatDuration = -1;
            this._timingFunction = '';
            if (animationElement) {
                const values = getNamedItem$6(animationElement, 'values');
                const keyTimes = this.duration !== -1 ? SvgAnimate.toFractionList(getNamedItem$6(animationElement, 'keyTimes')) : [];
                if (values) {
                    const valuesData = trimEnd(values, ';').split(/\s*;\s*/);
                    this.values = valuesData;
                    const length = valuesData.length;
                    if (length > 1 && length === keyTimes.length) {
                        this.from = valuesData[0];
                        this.to = valuesData[length - 1];
                        this.keyTimes = keyTimes;
                    }
                    else if (length === 1) {
                        this.to = this.values[0];
                        this.convertToValues();
                    }
                }
                else {
                    this.from = getNamedItem$6(animationElement, 'from');
                    this.convertToValues(keyTimes);
                }
                const repeatDur = getNamedItem$6(animationElement, 'repeatDur');
                if (repeatDur && repeatDur !== 'indefinite') {
                    const value = SvgAnimation.parseClockTime(repeatDur);
                    if (!isNaN(value) && value > 0) {
                        this._repeatDuration = value;
                    }
                }
                const repeatCount = getNamedItem$6(animationElement, 'repeatCount');
                this.iterationCount = repeatCount === 'indefinite' ? -1 : +repeatCount || 0;
                if (animationElement.tagName === 'animate') {
                    this.setCalcMode();
                }
            }
        }
        static getSplitValue(value, next, percent) {
            return value + (next - value) * percent;
        }
        static findTimingFunction(value) {
            const keySpline = SvgAnimate.KEYSPLINE_NAME[value];
            if (keySpline) {
                return keySpline;
            }
            else if (REGEXP_BEZIER.test(value)) {
                return value.trim();
            }
            else if (value.startsWith('step')) {
                return SvgAnimate.KEYSPLINE_NAME.linear;
            }
            const match = REGEXP_BEZIERCSS.exec(value);
            return match ? match[1] + ' ' + match[2] + ' ' + match[3] + ' ' + match[4] : SvgAnimate.KEYSPLINE_NAME.ease;
        }
        static fromStepTimingFunction(element, attributeName, timingFunction, keyTimes, values, index) {
            const valueA = values[index];
            const valueB = values[index + 1];
            const checkOptions = (value) => hasEm$1(value) ? { fontSize: getFontSize$1(element) } : undefined;
            let currentValue, nextValue;
            switch (attributeName) {
                case 'fill':
                case 'stroke': {
                    const start = parseColor$2(valueA) || index === 0 && parseColor$2('#000000') || parseColor$2(values[index - 1]);
                    const end = parseColor$2(valueB);
                    if (start && end) {
                        currentValue = [start];
                        nextValue = [end];
                    }
                    break;
                }
                case 'points':
                    currentValue = SvgBuild.convertPoints(SvgBuild.parseCoordinates(valueA));
                    nextValue = SvgBuild.convertPoints(SvgBuild.parseCoordinates(valueB));
                    break;
                case 'rotate':
                case 'scale':
                case 'translate':
                    currentValue = replaceMap$2(valueA.trim().split(/\s+/), value => +value);
                    nextValue = replaceMap$2(valueB.trim().split(/\s+/), value => +value);
                    break;
                default:
                    if (isNumber$3(valueA)) {
                        currentValue = [+valueA];
                    }
                    else if (isLength$1(valueA)) {
                        currentValue = [parseUnit$1(valueA, checkOptions(valueA))];
                    }
                    if (isNumber$3(valueB)) {
                        nextValue = [+valueB];
                    }
                    else if (isLength$1(valueB)) {
                        nextValue = [parseUnit$1(valueB, checkOptions(valueB))];
                    }
                    break;
            }
            if (currentValue && nextValue) {
                const length = currentValue.length;
                if (length === nextValue.length) {
                    switch (timingFunction) {
                        case 'step-start':
                            timingFunction = 'steps(1, start)';
                            break;
                        case 'step-end':
                            timingFunction = 'steps(1, end)';
                            break;
                    }
                    const match = /steps\((\d+)(?:,\s*(start|end|jump-(?:start|end|both|none)))?\)/.exec(timingFunction);
                    if (match) {
                        const keyTimeTotal = keyTimes[index + 1] - keyTimes[index];
                        const stepSize = +match[1];
                        const interval = 100 / stepSize;
                        const stepCount = stepSize + 1;
                        const splitTimes = new Array(stepCount);
                        const splitValues = new Array(stepCount);
                        for (let i = 0; i < stepCount; ++i) {
                            let offset = 0;
                            switch (match[2]) {
                                case 'start':
                                case 'jump-start':
                                    if (i === 0) {
                                        offset = 1;
                                    }
                                    break;
                                case 'jump-both':
                                    if (i < stepCount - 1) {
                                        offset = 1 / stepCount;
                                    }
                                    break;
                                case 'jump-none':
                                    if (i > 0) {
                                        offset = 1 / stepSize;
                                    }
                                    break;
                            }
                            const time = keyTimes[index] + keyTimeTotal * (i / stepSize);
                            const percent = time > 0 ? (interval * (i + offset)) / 100 : 0;
                            let result = '';
                            switch (attributeName) {
                                case 'fill':
                                case 'stroke': {
                                    const rgbaA = currentValue[0].rgba;
                                    const rgbaB = nextValue[0].rgba;
                                    result = convertHex({
                                        r: SvgAnimate.getSplitValue(rgbaA.r, rgbaB.r, percent),
                                        g: SvgAnimate.getSplitValue(rgbaA.g, rgbaB.g, percent),
                                        b: SvgAnimate.getSplitValue(rgbaA.b, rgbaB.b, percent),
                                        a: SvgAnimate.getSplitValue(rgbaA.a, rgbaB.a, percent)
                                    });
                                    break;
                                }
                                case 'points':
                                    for (let j = 0; j < length; ++j) {
                                        const current = currentValue[j];
                                        const next = nextValue[j];
                                        result += (j > 0 ? ' ' : '') + SvgAnimate.getSplitValue(current.x, next.x, percent) + ',' + SvgAnimate.getSplitValue(current.y, next.y, percent);
                                    }
                                    break;
                                default:
                                    for (let j = 0; j < length; ++j) {
                                        result += (j > 0 ? ' ' : '') + SvgAnimate.getSplitValue(currentValue[j], nextValue[j], percent);
                                    }
                                    break;
                            }
                            if (result) {
                                splitTimes[i] = time;
                                splitValues[i] = result;
                            }
                            else {
                                return null;
                            }
                        }
                        return [splitTimes, splitValues];
                    }
                }
            }
            return null;
        }
        static toFractionList(value, delimiter = ';', ordered = true) {
            let previous = 0;
            const result = replaceMap$2(value.split(delimiter), seg => {
                const fraction = +seg;
                if (!isNaN(fraction) && (!ordered || fraction >= previous && fraction <= 1)) {
                    previous = fraction;
                    return fraction;
                }
                return -1;
            });
            return result.length > 1 && (!ordered || result[0] === 0 && result.some(percent => percent !== -1)) ? result : [];
        }
        setCalcMode(attributeName, mode) {
            const animationElement = this.animationElement;
            if (animationElement) {
                switch (mode || (mode = getNamedItem$6(animationElement, 'calcMode') || 'linear')) {
                    case 'discrete': {
                        const keyTimesBase = this.keyTimes;
                        if (keyTimesBase[0] === 0 && keyTimesBase.length === 2) {
                            const valuesBase = this.values;
                            const keyTimes = [], values = [];
                            for (let i = 0, length = keyTimesBase.length - 1; i < length; ++i) {
                                const result = SvgAnimate.fromStepTimingFunction(animationElement, attributeName || this.attributeName, 'step-end', keyTimesBase, valuesBase, i);
                                if (result) {
                                    keyTimes.push(...result[0]);
                                    values.push(...result[1]);
                                }
                            }
                            keyTimes.push(keyTimesBase.pop());
                            values.push(valuesBase.pop());
                            this._values = values;
                            this._keyTimes = keyTimes;
                            this._keySplines = [SvgAnimate.KEYSPLINE_NAME['step-end']];
                        }
                        break;
                    }
                    case 'paced':
                        this._keySplines = null;
                        break;
                    case 'spline':
                        this.keySplines = replaceMap$2(getNamedItem$6(animationElement, 'keySplines').split(';'), value => value.trim()).filter(value => value);
                    case 'linear': {
                        const keyTimesBase = this.keyTimes;
                        if (keyTimesBase[0] !== 0 && lastItemOf$2(keyTimesBase) !== 1) {
                            const length = this.values.length;
                            const keyTimes = new Array(length);
                            for (let i = 0; i < length; ++i) {
                                keyTimes[i] = i / (length - 1);
                            }
                            this._keyTimes = keyTimes;
                            this._keySplines = null;
                        }
                        break;
                    }
                }
            }
        }
        convertToValues(keyTimes) {
            const to = this.to;
            if (to) {
                this.values = [this.from, to];
                if (keyTimes && keyTimes.length === 2) {
                    const keyTimesBase = this.keyTimes;
                    if (keyTimesBase.length !== 2 || keyTimesBase[0] === 0 && keyTimesBase[1] <= 1) {
                        this.keyTimes = keyTimes;
                        return;
                    }
                }
                this.keyTimes = [0, 1];
            }
        }
        setGroupOrdering(value) {
            this.group.ordering = value;
            if (this.fillBackwards) {
                const name = this.group.name;
                let found;
                for (let i = value.length - 1; i >= 0; --i) {
                    const item = value[i];
                    if (found) {
                        if (item.fillMode !== 'forwards') {
                            this.fillBackwards = false;
                            break;
                        }
                    }
                    else if (item.name === name) {
                        found = true;
                    }
                }
            }
        }
        getIntervalEndTime(leadTime, complete) {
            const endTime = this.getTotalDuration();
            if (leadTime < endTime) {
                const { duration, keyTimes } = this;
                let delay = this.delay;
                while (delay + duration <= leadTime) {
                    delay += duration;
                }
                return Math.min(delay + (complete ? 1 : lastItemOf$2(keyTimes) || 0) * duration, endTime);
            }
            return endTime;
        }
        getTotalDuration(minimum) {
            let iterationCount = this.iterationCount;
            if (minimum && iterationCount === -1) {
                iterationCount = 1;
            }
            if (iterationCount !== -1) {
                return Math.min(this.delay + this.duration * iterationCount, this.end || Infinity);
            }
            return Infinity;
        }
        set delay(value) {
            this._delay = value;
            const animationElement = this.animationElement;
            const end = animationElement && getNamedItem$6(animationElement, 'end');
            if (end) {
                const endTime = sortNumber$3(replaceMap$2(end.split(';'), time => SvgAnimation.parseClockTime(time)).filter(time => !isNaN(time)))[0];
                if (!isNaN(endTime)) {
                    const { duration, iterationCount } = this;
                    if (iterationCount === -1 || duration > 0 && endTime < duration * iterationCount) {
                        if (value > endTime) {
                            this.end = endTime;
                            if (iterationCount === -1) {
                                this.iterationCount = Math.ceil((endTime - value) / duration);
                            }
                        }
                        else {
                            this.duration = -1;
                        }
                    }
                }
            }
        }
        get delay() {
            return this._delay;
        }
        set duration(value) {
            super.duration = value;
        }
        get duration() {
            const value = this._duration;
            return value === -1 && this._repeatDuration !== -1 ? this._repeatDuration : value;
        }
        set to(value) {
            this._to = value;
        }
        get to() {
            return this._setterType ? this.valueTo || this._to : this.setterType ? this.values[0] : this._to;
        }
        get from() {
            return this._from;
        }
        set from(value) {
            if (!this._values) {
                const animationElement = this.animationElement;
                if (animationElement) {
                    if (!this.to) {
                        const by = getNamedItem$6(animationElement, 'by');
                        const byCoords = SvgBuild.parseCoordinates(by);
                        if (byCoords.length && (value || (value = this.baseValue || ''))) {
                            const fromCoords = SvgBuild.parseCoordinates(value);
                            const length = fromCoords.length;
                            if (byCoords.length === length) {
                                let to = '';
                                for (let i = 0; i < length; ++i) {
                                    to += (i > 0 ? ',' : '') + (fromCoords[i] + byCoords[i]);
                                }
                                this.to = to;
                            }
                        }
                    }
                    if (SvgBuild.parseCoordinates(this.to).length) {
                        this.setAttribute('additive', 'sum');
                    }
                }
            }
            this._from = value;
        }
        set iterationCount(value) {
            this._iterationCount = isNaN(value) ? 1 : value;
            const animationElement = this.animationElement;
            if (animationElement) {
                if (this.iterationCount !== -1) {
                    this.setAttribute('accumulate', 'sum');
                    this.fillFreeze = getNamedItem$6(animationElement, 'fill') === 'freeze';
                }
                else {
                    this.accumulateSum = false;
                    this.fillFreeze = false;
                }
            }
        }
        get iterationCount() {
            const duration = this.duration;
            if (duration > 0) {
                const iterationCount = this._iterationCount;
                const repeatDuration = this._repeatDuration;
                if (repeatDuration !== -1 && (iterationCount === -1 || repeatDuration < iterationCount * duration)) {
                    return repeatDuration / duration;
                }
                return iterationCount;
            }
            return 1;
        }
        set values(value) {
            this._values = value;
            if (value && value.length !== this.keyTimes.length) {
                this._keyTimes = null;
                this._keySplines = null;
            }
        }
        get values() {
            return this._values || (this._values = []);
        }
        set keyTimes(value) {
            const values = this._values;
            if ((!values || values.length === value.length) && value.every(fraction => fraction >= 0 && fraction <= 1)) {
                this._keyTimes = value;
            }
        }
        get keyTimes() {
            return this._keyTimes || (this._keyTimes = []);
        }
        set keySplines(value) {
            if (value && value.length) {
                const minSegment = this.keyTimes.length - 1;
                if (value.length >= minSegment && !value.every(spline => !spline || spline === SvgAnimate.KEYSPLINE_NAME.linear)) {
                    const keySplines = [];
                    for (let i = 0; i < minSegment; ++i) {
                        const points = replaceMap$2(value[i].split(/\s+/), pt => +pt);
                        if (points.length === 4 && !points.some(pt => isNaN(pt)) && points[0] >= 0 && points[0] <= 1 && points[2] >= 0 && points[2] <= 1) {
                            keySplines.push(points.join(' '));
                        }
                        else {
                            keySplines.push(SvgAnimate.KEYSPLINE_NAME.linear);
                        }
                    }
                    this._keySplines = keySplines;
                }
            }
            else {
                this._keySplines = null;
            }
        }
        get keySplines() {
            return this._keySplines;
        }
        set timingFunction(value) {
            this._timingFunction = value ? SvgAnimate.findTimingFunction(value) : value;
        }
        get timingFunction() {
            var _a;
            return this._timingFunction || ((_a = this.keySplines) === null || _a === void 0 ? void 0 : _a[0]) || '';
        }
        set reverse(value) {
            if (this.length && value !== this._reverse) {
                const keyTimesBase = this.keyTimes;
                const keySplinesBase = this._keySplines;
                const length = keyTimesBase.length;
                const keyTimes = new Array(length);
                for (let i = length - 1, j = 0; i >= 0; --i) {
                    keyTimes[j++] = 1 - keyTimesBase[i];
                }
                this.keyTimes = keyTimes;
                this.values.reverse();
                if (keySplinesBase) {
                    const keySplines = [];
                    for (let i = keySplinesBase.length - 1; i >= 0; --i) {
                        const points = replaceMap$2(keySplinesBase[i].split(' '), pt => +pt);
                        keySplines.push(points.length === 4 ? invertControlPoint(points[2]) + ' ' + invertControlPoint(points[3]) + ' ' + invertControlPoint(points[0]) + ' ' + invertControlPoint(points[1]) : SvgAnimate.KEYSPLINE_NAME.linear);
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
        set setterType(value) {
            this._setterType = value;
        }
        get setterType() {
            if (this._setterType) {
                return true;
            }
            else if (this.animationElement && this.duration === 0) {
                const keyTimes = this.keyTimes;
                return keyTimes.length >= 2 && keyTimes[0] === 0 && this.values[0] !== '';
            }
            return false;
        }
        set length(value) {
            if (value === 0) {
                this._values = null;
            }
        }
        get length() {
            return this._values ? this._values.length : 0;
        }
        get valueTo() {
            return this._values && lastItemOf$2(this._values) || '';
        }
        get valueFrom() {
            return this.values[0] || '';
        }
        get playable() {
            return !this.paused && this.duration > 0 && this.keyTimes.length > 0;
        }
        get fillReplace() {
            return super.fillReplace || this.iterationCount === -1;
        }
        get fromToType() {
            const keyTimes = this.keyTimes;
            return keyTimes.length === 2 && keyTimes[0] === 0 && keyTimes[1] === 1;
        }
        get evaluateStart() {
            const keyTimes = this.keyTimes;
            return keyTimes.length > 0 && keyTimes[0] > 0;
        }
        get evaluateEnd() {
            const keyTimes = this.keyTimes;
            return keyTimes.length > 0 && lastItemOf$2(keyTimes) < 1;
        }
    }
    SvgAnimate.KEYSPLINE_NAME = {
        'ease': '0.25 0.1 0.25 1',
        'ease-in': '0.42 0 1 1',
        'ease-in-out': '0.42 0 0.58 1',
        'ease-out': '0 0 0.58 1',
        'linear': '0 0 1 1',
        'step-start': '0 1 0 1',
        'step-end': '1 0 1 0'
    };

    const { getNamedItem: getNamedItem$5 } = squared.lib.dom;
    class SvgAnimateTransform extends SvgAnimate {
        constructor(element, animationElement) {
            super(element, animationElement);
            this.instanceType = 98312 /* SVG_ANIMATE_TRANSFORM */;
            if (animationElement) {
                const type = getNamedItem$5(animationElement, 'type');
                this.setType(type);
                this.setCalcMode(type);
            }
        }
        static toRotateList(values) {
            const length = values.length;
            const result = new Array(length);
            for (let i = 0; i < length; ++i) {
                if (values[i]) {
                    const seg = SvgBuild.parseCoordinates(values[i]);
                    if (seg.length === 2) {
                        seg[2] = 0;
                    }
                    if (seg.length === 3) {
                        result[i] = seg;
                    }
                    else {
                        return null;
                    }
                }
                else {
                    result[i] = [0, 0, 0];
                }
            }
            return result;
        }
        static toScaleList(values) {
            const length = values.length;
            const result = new Array(length);
            for (let i = 0; i < length; ++i) {
                if (values[i]) {
                    const seg = SvgBuild.parseCoordinates(values[i]);
                    if (seg.length === 1) {
                        seg[1] = seg[0];
                    }
                    if (seg.length === 2) {
                        seg[2] = 0;
                        seg[3] = 0;
                    }
                    if (seg.length === 4) {
                        result[i] = seg;
                    }
                    else {
                        return null;
                    }
                }
                else {
                    result[i] = [1, 1, 0, 0];
                }
            }
            return result;
        }
        static toTranslateList(values) {
            const length = values.length;
            const result = new Array(length);
            for (let i = 0; i < length; ++i) {
                if (values[i]) {
                    const seg = SvgBuild.parseCoordinates(values[i]);
                    if (seg.length === 1) {
                        seg[1] = 0;
                    }
                    if (seg.length === 2) {
                        result[i] = seg;
                    }
                    else {
                        return null;
                    }
                }
                else {
                    result[i] = [0, 0];
                }
            }
            return result;
        }
        static toSkewList(values) {
            const length = values.length;
            const result = new Array(length);
            for (let i = 0; i < length; ++i) {
                if (values[i]) {
                    const seg = SvgBuild.parseCoordinates(values[i]);
                    if (seg.length === 1) {
                        result[i] = seg;
                    }
                    else {
                        return null;
                    }
                }
                else {
                    result[i] = [0];
                }
            }
            return result;
        }
        expandToValues() {
            if (this.additiveSum) {
                const { duration, keyTimes: keyTimesBase, iterationCount } = this;
                if (iterationCount !== -1 && duration > 0 && keyTimesBase.length) {
                    const durationTotal = duration * iterationCount;
                    invalid: {
                        const { type, keySplines: keySplinesBase, values: valuesBase } = this;
                        const keyTimes = [];
                        const values = [];
                        const keySplines = [];
                        let previousValues;
                        for (let i = 0, length = keyTimesBase.length; i < iterationCount; ++i) {
                            if (i > 0 && keySplinesBase) {
                                keySplines.push('');
                            }
                            for (let j = 0; j < length; ++j) {
                                const coordinates = SvgBuild.parseCoordinates(valuesBase[j]);
                                const q = coordinates.length;
                                if (q) {
                                    let currentValues;
                                    switch (type) {
                                        case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                                            if (q === 1) {
                                                currentValues = [coordinates[0], 0];
                                            }
                                            else if (q === 2) {
                                                currentValues = coordinates;
                                            }
                                            break;
                                        case SVGTransform.SVG_TRANSFORM_SCALE:
                                            if (q === 1) {
                                                currentValues = [coordinates[0], coordinates[0]];
                                            }
                                            else if (q === 2) {
                                                currentValues = coordinates;
                                            }
                                            break;
                                        case SVGTransform.SVG_TRANSFORM_ROTATE:
                                            if (q === 1) {
                                                currentValues = [coordinates[0], 0, 0];
                                            }
                                            else if (q === 3) {
                                                currentValues = coordinates;
                                            }
                                            break;
                                        case SVGTransform.SVG_TRANSFORM_SKEWX:
                                        case SVGTransform.SVG_TRANSFORM_SKEWY:
                                            if (q === 1) {
                                                currentValues = coordinates;
                                            }
                                            break;
                                    }
                                    if (currentValues) {
                                        let time = (keyTimesBase[j] + i) * duration;
                                        if (previousValues) {
                                            for (let k = 0, r = currentValues.length; k < r; ++k) {
                                                currentValues[k] += previousValues[k];
                                            }
                                        }
                                        if (i < iterationCount - 1 && j === length - 1) {
                                            if (this.accumulateSum) {
                                                previousValues = currentValues;
                                            }
                                            --time;
                                        }
                                        keyTimes.push(time / durationTotal);
                                        values.push(currentValues.join(' '));
                                        if (keySplinesBase && j < length - 1) {
                                            keySplines.push(keySplinesBase[j]);
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
                        this.keySplines = keySplines.length ? keySplines : null;
                        this.duration = durationTotal;
                        this.iterationCount = 1;
                        this.accumulateSum = false;
                    }
                }
            }
        }
        setType(value) {
            let values = null;
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
                this.values = values.map(array => array.join(' '));
            }
            this.baseValue = TRANSFORM.typeAsValue(this.type);
        }
        set attributeName(value) { }
        get attributeName() {
            return 'transform';
        }
    }

    const { sortNumber: sortNumber$2, splitPairStart } = squared.lib.util;
    function insertIntervalValue(intervalMap, time, value, endTime = 0, animation, start = false, end = false, fillMode = 0, infinite = false, valueFrom) {
        if (value) {
            let data = intervalMap.get(time);
            if (!data) {
                data = [];
                intervalMap.set(time, data);
            }
            data.push({
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
        }
    }
    class SvgAnimationIntervalMap {
        constructor(animations, ...attrs) {
            var _a;
            animations = (attrs.length ? animations.filter(item => attrs.includes(item.attributeName)) : animations.slice(0)).sort((a, b) => a.delay === b.delay ? b.group.id - a.group.id : a.delay - b.delay);
            const map = {};
            const intervalMap = {};
            const keyNames = new Set();
            const length = animations.length;
            for (let i = 0; i < length; ++i) {
                keyNames.add(SvgAnimationIntervalMap.getKeyName(animations[i]));
            }
            for (const keyName of keyNames) {
                map[keyName] = new Map();
                intervalMap[keyName] = new Map();
                const attributeName = splitPairStart(keyName, ':');
                const backwards = animations.filter(item => item.fillBackwards && item.attributeName === attributeName).sort((a, b) => b.group.id - a.group.id)[0];
                if (backwards) {
                    const delay = backwards.delay;
                    insertIntervalValue(intervalMap[keyName], 0, backwards.values[0], delay, backwards, delay === 0, false, 4 /* BACKWARDS */);
                }
            }
            for (let i = 0; i < length; ++i) {
                const item = animations[i];
                const keyName = SvgAnimationIntervalMap.getKeyName(item);
                const mapData = intervalMap[keyName];
                if (item.baseValue && !intervalMap[keyName][-1]) {
                    insertIntervalValue(mapData, -1, item.baseValue);
                }
                if (item.setterType) {
                    const { delay, duration } = item;
                    const fillReplace = item.fillReplace && duration > 0;
                    insertIntervalValue(mapData, delay, item.to, fillReplace ? delay + duration : 0, item, fillReplace, !fillReplace, 1 /* FREEZE */);
                    if (fillReplace) {
                        insertIntervalValue(mapData, delay + duration, '', 0, item, false, true, 1 /* FREEZE */);
                    }
                }
                else if (SvgBuild.isAnimate(item) && item.duration > 0) {
                    const infinite = item.iterationCount === -1;
                    const timeEnd = item.getTotalDuration();
                    insertIntervalValue(mapData, item.delay, item.valueTo, timeEnd, item, true, false, 0, infinite, item.valueFrom);
                    if (!infinite && !item.fillReplace) {
                        insertIntervalValue(mapData, timeEnd, item.valueTo, 0, item, false, true, item.fillForwards ? 2 /* FORWARDS */ : 1 /* FREEZE */);
                    }
                }
            }
            for (const keyName in intervalMap) {
                const keyTimes = sortNumber$2(Array.from(intervalMap[keyName].keys()));
                for (let i = 0, q = keyTimes.length; i < q; ++i) {
                    const time = keyTimes[i];
                    const values = intervalMap[keyName].get(time);
                    for (let j = 0; j < values.length; ++j) {
                        const interval = values[j];
                        const animation = interval.animation;
                        if (!interval.value || animation && interval.start && SvgBuild.isAnimate(animation) && !animation.from) {
                            let value;
                            for (const group of map[keyName].values()) {
                                for (let k = 0, s = group.length; k < s; ++k) {
                                    const previous = group[k];
                                    if (animation !== previous.animation && previous.value && (previous.time === -1 || previous.fillMode === 2 /* FORWARDS */ || previous.fillMode === 1 /* FREEZE */)) {
                                        value = previous.value;
                                        break;
                                    }
                                }
                            }
                            if (value) {
                                interval.value = value;
                            }
                            else if (!interval.value) {
                                values.splice(j--, 1);
                            }
                        }
                    }
                    if (values.length) {
                        values.sort((a, b) => a.animation && b.animation ? a.fillMode === b.fillMode ? b.animation.group.id - a.animation.group.id : b.fillMode - a.fillMode : 0);
                        map[keyName].set(time, values);
                    }
                }
            }
            for (const keyName in map) {
                for (const [timeA, dataA] of map[keyName]) {
                    for (let i = 0, q = dataA.length; i < q; ++i) {
                        const itemA = dataA[i];
                        const animationA = itemA.animation;
                        if (animationA) {
                            if (itemA.fillMode === 1 /* FREEZE */) {
                                const previous = [];
                                for (const [timeB, dataB] of map[keyName]) {
                                    if (timeB < timeA) {
                                        for (let j = 0, r = dataB.length; j < r; ++j) {
                                            const itemB = dataB[j];
                                            if (itemB.start) {
                                                const animation = itemB.animation;
                                                if (animation && animation.animationElement) {
                                                    previous.push(animation);
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        for (let j = 0; j < dataB.length; ++j) {
                                            const itemB = dataB[j];
                                            if (timeB > timeA) {
                                                if (itemB.end && previous.includes(itemB.animation)) {
                                                    dataB.splice(j--, 1);
                                                }
                                            }
                                            else if (itemB.end) {
                                                const animation = itemB.animation;
                                                if (animation && animation.animationElement && animation.group.id < animationA.group.id) {
                                                    dataB.splice(j--, 1);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            else if (itemA.fillMode === 2 /* FORWARDS */ || itemA.infinite) {
                                let forwarded;
                                const group = animationA.group;
                                const ordering = group.ordering;
                                if (ordering) {
                                    const duration = animationA.getTotalDuration();
                                    const name = group.name;
                                    for (let j = 0, r = ordering.length; j < r; ++j) {
                                        const sibling = ordering[j];
                                        if (sibling.name === name) {
                                            forwarded = true;
                                        }
                                        else if (SvgAnimationIntervalMap.getGroupEndTime(sibling) >= duration) {
                                            break;
                                        }
                                    }
                                }
                                const previous = [];
                                for (const [timeB, dataB] of map[keyName]) {
                                    if (!forwarded && timeB < timeA) {
                                        for (let j = 0, r = dataB.length; j < r; ++j) {
                                            const itemB = dataB[j];
                                            if (itemB.start) {
                                                const animationB = itemB.animation;
                                                if (animationB) {
                                                    previous.push(animationB);
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        for (let j = 0; j < dataB.length; ++j) {
                                            const itemB = dataB[j];
                                            if (timeB > timeA) {
                                                const animationB = itemB.animation;
                                                if (forwarded || animationB && (itemB.end && previous.includes(animationB) || !animationA.animationElement && animationB.group.id < animationA.group.id)) {
                                                    dataB.splice(j--, 1);
                                                }
                                            }
                                            else if (itemB.end) {
                                                const id = ((_a = itemB.animation) === null || _a === void 0 ? void 0 : _a.group.id) || NaN;
                                                if (id < animationA.group.id) {
                                                    dataB.splice(j--, 1);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            for (const keyName in map) {
                const data = map[keyName];
                for (const [time, entry] of data) {
                    if (entry.length === 0) {
                        data.delete(time);
                    }
                }
            }
            this.map = map;
        }
        static getGroupEndTime(item) {
            return item.iterationCount === 'infinite' ? Infinity : item.delay + item.duration * +item.iterationCount;
        }
        static getKeyName(item) {
            return item.attributeName + (SvgBuild.isAnimateTransform(item) ? ':' + TRANSFORM.typeAsName(item.type) : '');
        }
        has(attr, time, animation) {
            const map = this.map[attr];
            if (time !== undefined) {
                if (map && map.has(time)) {
                    if (!animation) {
                        return true;
                    }
                    return map.get(time).findIndex(item => item.animation === animation) !== -1;
                }
                return false;
            }
            return !!map;
        }
        get(attr, time, playing) {
            const map = this.map[attr];
            if (map) {
                let value;
                for (const [interval, data] of map) {
                    if (interval <= time) {
                        for (let i = 0, length = data.length; i < length; ++i) {
                            const previous = data[i];
                            if (previous.value && (previous.time === -1 || previous.end && (previous.fillMode === 2 /* FORWARDS */ || previous.fillMode === 1 /* FREEZE */)) || playing && previous.start && time !== interval) {
                                value = previous.value;
                                break;
                            }
                        }
                    }
                    else {
                        break;
                    }
                }
                return value;
            }
        }
        paused(attr, time) {
            const map = this.map[attr];
            if (map) {
                let state = 0;
                for (const [interval, entry] of map) {
                    if (interval <= time) {
                        for (let i = 0, length = entry.length; i < length; ++i) {
                            const previous = entry[i];
                            if (previous.start && (previous.infinite || previous.fillMode === 0 && previous.endTime > time)) {
                                if (previous.animation) {
                                    state = 2;
                                }
                                else {
                                    state = 1;
                                    break;
                                }
                            }
                            else if (previous.end && (previous.fillMode === 2 /* FORWARDS */ || state === 1 && previous.fillMode === 1 /* FREEZE */)) {
                                state = 0;
                                break;
                            }
                        }
                    }
                    else {
                        break;
                    }
                }
                return state === 0;
            }
            return true;
        }
        evaluateStart(item, fallback) {
            const values = item.values;
            const length = values.length;
            if (length) {
                const value = (item.reverse ? values[length - 1] : values[0]) || this.get(item.attributeName, item.delay) || fallback || item.baseValue;
                if (value) {
                    if (item.reverse) {
                        values[length - 1] = value;
                        item.to = value;
                    }
                    else {
                        values[0] = value;
                        item.from = value;
                    }
                }
            }
            return values;
        }
    }

    const { clamp, equal: equal$1, multipleOf: multipleOf$1 } = squared.lib.math;
    const { hasKeys, hasValue, isEqual: isEqual$1, isNumber: isNumber$2, joinArray: joinArray$1, lastItemOf: lastItemOf$1, plainMap: plainMap$2, replaceMap: replaceMap$1, spliceArray, sortNumber: sortNumber$1 } = squared.lib.util;
    function insertAdjacentSplitValue(map, attr, time, intervalMap, transforming) {
        let previousTime = 0, previousValue, previous, next;
        for (const [key, value] of map) {
            if (time === key) {
                previous = { key, value };
                break;
            }
            else if (time > previousTime && time < key && previousValue !== undefined) {
                previous = {
                    key: previousTime,
                    value: previousValue
                };
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
            if (value !== undefined) {
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
        for (let i = 0; i < length; ++i) {
            const item = values[i];
            let fraction = item[0] / timeTotal;
            if (fraction > 0) {
                let j = 7;
                do {
                    const value = +fraction.toString().substring(0, j);
                    if (!previous.has(value)) {
                        fraction = value;
                        break;
                    }
                } while (++j);
            }
            item[0] = fraction;
            previous.add(fraction);
        }
        return values;
    }
    function convertToAnimateValue(value, fromString) {
        if (typeof value === 'string') {
            if (isNumber$2(value)) {
                value = +value;
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
            for (let i = 0, length = items.length; i < length; ++i) {
                const item = items[i];
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
        var _a;
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
                return;
        }
        const transformOrigin = TRANSFORM.origin(path.element);
        for (let i = 0, length = entries.length; i < length; ++i) {
            invalid: {
                const [key, data] = entries[i];
                const values = [];
                for (let j = 0, q = baseVal.length; j < q; ++j) {
                    const attr = baseVal[j];
                    let value = data.get(attr);
                    if (value === undefined) {
                        value = (_a = getForwardValue(forwardMap[attr], key)) !== null && _a !== void 0 ? _a : path.getBaseValue(attr);
                    }
                    if (value !== undefined) {
                        values.push(value);
                    }
                    else {
                        break invalid;
                    }
                }
                let points;
                switch (tagName) {
                    case 'line':
                        points = [
                            { x: values[0], y: values[1] },
                            { x: values[2], y: values[4] }
                        ];
                        break;
                    case 'rect': {
                        const [width, height, x, y] = values;
                        points = [
                            { x, y },
                            { x: x + width, y },
                            { x: x + width, y: y + height },
                            { x, y: y + height }
                        ];
                        break;
                    }
                    case 'polygon':
                    case 'polyline':
                        points = values[0];
                        break;
                    case 'circle':
                    case 'ellipse':
                        points = [{ x: values[0], y: values[1], rx: values[2], ry: lastItemOf$1(values) }];
                        break;
                }
                if (path.transformed) {
                    points = SvgBuild.applyTransforms(path.transformed, points, transformOrigin);
                }
                if (parent) {
                    parent.refitPoints(points);
                }
                let value;
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
                    case 'ellipse': {
                        const { x, y, rx, ry } = points[0];
                        value = SvgBuild.drawEllipse(x, y, rx, ry, precision);
                        break;
                    }
                }
                if (value !== undefined) {
                    result.push({ key, value });
                }
            }
        }
        return result;
    }
    function createKeyTimeMap(map, keyTimes, forwardMap) {
        var _a;
        const result = new Map();
        for (let i = 0, length = keyTimes.length; i < length; ++i) {
            const keyTime = keyTimes[i];
            const values = new Map();
            for (const attr in map) {
                const value = (_a = map[attr].get(keyTime)) !== null && _a !== void 0 ? _a : getForwardValue(forwardMap[attr], keyTime);
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
                    const baseArray = replaceMap$1(baseValue.split(' '), value => +value);
                    const valuesArray = plainMap$2(values, value => replaceMap$1(value.trim().split(' '), pt => +pt));
                    const length = baseArray.length;
                    if (valuesArray.every(value => value.length === length)) {
                        const result = valuesArray[index];
                        if (!item.accumulateSum) {
                            iteration = 0;
                        }
                        for (let i = 0; i < length; ++i) {
                            result[i] += baseArray[i];
                        }
                        for (let i = 0, q = valuesArray.length; i < iteration; ++i) {
                            for (let j = 0; j < q; ++j) {
                                const value = valuesArray[j];
                                for (let k = 0, r = value.length; k < r; ++k) {
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
                let result = +values[index];
                if (!isNaN(result)) {
                    if (item.additiveSum && typeof baseValue === 'number') {
                        result += baseValue;
                        if (!item.accumulateSum) {
                            iteration = 0;
                        }
                        for (let i = 0, length = values.length; i < iteration; ++i) {
                            for (let j = 0; j < length; ++j) {
                                result += +values[j];
                            }
                        }
                    }
                    return result;
                }
            }
        }
        return baseValue || 0;
    }
    function getItemSplitValue(fraction, previousFraction, previousValue, nextFraction, nextValue) {
        if (fraction > previousFraction) {
            if (typeof previousValue === 'number' && typeof nextValue === 'number') {
                return SvgAnimate.getSplitValue(previousValue, nextValue, (fraction - previousFraction) / (nextFraction - previousFraction));
            }
            else if (typeof previousValue === 'string' && typeof nextValue === 'string') {
                const previousArray = replaceMap$1(previousValue.split(' '), value => +value);
                const nextArray = replaceMap$1(nextValue.split(' '), value => +value);
                const length = previousArray.length;
                if (length === nextArray.length) {
                    let result = '';
                    for (let i = 0; i < length; ++i) {
                        result += (i > 0 ? ' ' : '') + getItemSplitValue(fraction, previousFraction, previousArray[i], nextFraction, nextArray[i]);
                    }
                    return result;
                }
            }
            else if (Array.isArray(previousValue) && Array.isArray(nextValue)) {
                const result = [];
                for (let i = 0, length = Math.min(previousValue.length, nextValue.length); i < length; ++i) {
                    const previous = previousValue[i];
                    const next = nextValue[i];
                    result.push({
                        x: getItemSplitValue(fraction, previousFraction, previous.x, nextFraction, next.x),
                        y: getItemSplitValue(fraction, previousFraction, previous.y, nextFraction, next.y)
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
        const fraction = offset === 0
            ? index === 0
                ? 0
                : 1
            : clamp(offset / duration);
        let previousIndex = -1, nextIndex = -1;
        for (let l = 0, length = keyTimes.length; l < length; ++l) {
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
    function getIntermediateSplitValue(subTime, splitTime, item, keyTimes, values, duration, interval, baseValue) {
        const fraction = (subTime - splitTime) / duration;
        for (let i = 1, length = keyTimes.length; i < length; ++i) {
            const previousTime = keyTimes[i - 1];
            const time = keyTimes[i];
            if (fraction >= previousTime && fraction <= time) {
                return convertToString(getItemSplitValue(fraction, previousTime, getItemValue(item, values, interval, i - 1, baseValue), time, getItemValue(item, values, interval, i, baseValue)));
            }
        }
    }
    function appendPartialKeyTimes(map, forwardMap, baseValueMap, interval, item, keyTimes, values, keySplines, baseValue, queued, evaluateStart) {
        let length = values.length;
        keySplines || (keySplines = new Array(length - 1).fill(''));
        const { delay, duration } = item;
        const startTime = delay + duration * interval;
        const itemEndTime = item.getTotalDuration();
        const intervalEndTime = startTime + (evaluateStart ? keyTimes[0] : 1) * duration;
        const finalValue = +values[evaluateStart ? 0 : length - 1];
        let maxTime = startTime;
        complete: {
            length = queued.length;
            for (let i = 0; i < length; ++i) {
                const sub = queued[i];
                if (sub !== item) {
                    const totalDuration = sub.getTotalDuration();
                    sub.addState(2 /* INTERRUPTED */);
                    if (totalDuration > maxTime) {
                        const [subKeyTimes, subValues, subKeySplines] = cloneKeyTimes(sub);
                        setStartItemValues(map, forwardMap, baseValueMap, sub, baseValue, subKeyTimes, subValues, subKeySplines);
                        let nextStartTime = intervalEndTime;
                        partialEnd: {
                            let joined, j = getStartIteration(maxTime, sub.delay, sub.duration) - 1;
                            const insertSubstituteTimeValue = (subTime, splitTime, index) => {
                                let resultTime = evaluateStart
                                    ? maxTime === startTime && !joined ? 0 : (subTime % duration) / duration
                                    : splitTime === intervalEndTime ? 1 : (splitTime % duration) / duration;
                                let splitValue = subTime === splitTime
                                    ? convertToString(getItemValue(sub, subValues, j, index, baseValue))
                                    : getIntermediateSplitValue(subTime, splitTime, sub, subKeyTimes, subValues, sub.duration, j, baseValue);
                                if (splitValue) {
                                    if (resultTime > 0) {
                                        splitValue = Math.round((+splitValue + finalValue) / 2).toString();
                                    }
                                    const q = keyTimes.length;
                                    if (!(resultTime === keyTimes[q - 1] && splitValue === values[q - 1])) {
                                        const keySpline = joined || resultTime === 0 ? subKeySplines && subKeySplines[index] || sub.timingFunction : '';
                                        if (evaluateStart) {
                                            if (!joined && resultTime > 0 && subTime === maxTime) {
                                                resultTime += 1 / 1000;
                                            }
                                            for (let l = 0; l < q; ++l) {
                                                if (resultTime <= keyTimes[l]) {
                                                    if (l === 0 || resultTime === 0) {
                                                        keyTimes.unshift(resultTime);
                                                        values.unshift(splitValue);
                                                        keySplines.unshift(keySpline);
                                                    }
                                                    else {
                                                        keyTimes.splice(l, 0, resultTime);
                                                        values.splice(l, 0, splitValue);
                                                        keySplines.splice(l, 0, keySpline);
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                        else {
                                            if ((splitTime === totalDuration || splitTime === intervalEndTime) && splitTime < itemEndTime) {
                                                resultTime -= 1 / 1000;
                                            }
                                            keyTimes.push(resultTime);
                                            values.push(splitValue);
                                            keySplines.push(keySpline);
                                        }
                                    }
                                }
                            };
                            do {
                                if (evaluateStart) {
                                    for (let k = i + 1; k < length; ++k) {
                                        const next = queued[k];
                                        if (next.delay > maxTime) {
                                            nextStartTime = next.delay;
                                            break;
                                        }
                                    }
                                }
                                for (let l = 0, q = subKeyTimes.length; l < q; ++l) {
                                    const time = getItemTime(sub.delay, sub.duration, subKeyTimes, j, l);
                                    if (time >= maxTime) {
                                        if (!joined) {
                                            insertSubstituteTimeValue(time, maxTime, l);
                                            joined = true;
                                        }
                                        if (time > maxTime) {
                                            if (evaluateStart && time >= intervalEndTime) {
                                                break complete;
                                            }
                                            insertSubstituteTimeValue(time, Math.min(time, totalDuration, intervalEndTime), l);
                                            if (time >= intervalEndTime) {
                                                break complete;
                                            }
                                            else {
                                                maxTime = time;
                                                if (time >= totalDuration) {
                                                    if (totalDuration <= itemEndTime) {
                                                        sub.addState(8 /* COMPLETE */);
                                                    }
                                                    break partialEnd;
                                                }
                                                else if (time >= nextStartTime) {
                                                    break partialEnd;
                                                }
                                            }
                                        }
                                    }
                                }
                            } while (++j);
                        }
                    }
                }
            }
        }
        return [keyTimes, values, keySplines];
    }
    function setTimelineValue(map, time, value, duplicate) {
        if (value !== '') {
            let stored = map.get(time), previousTime;
            if (stored === undefined) {
                stored = map.get(time - 1);
                previousTime = true;
            }
            if (stored !== value || duplicate) {
                if (!duplicate) {
                    if (typeof stored === 'number' && equal$1(value, stored)) {
                        return time;
                    }
                    while (time > 0 && map.has(time)) {
                        ++time;
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
            --index;
        }
        const value = keySplines && keySplines[index];
        if (value) {
            map.set(time, value);
        }
        if (transformOriginMap) {
            setTransformOrigin(transformOriginMap, item, time, index);
        }
    }
    function setStartItemValues(map, forwardMap, baseValueMap, item, baseValue, keyTimes, values, keySplines) {
        var _a;
        if (keyTimes[0] !== 0) {
            let value;
            if (item.additiveSum) {
                value = convertToString(baseValue);
            }
            else {
                value = ((_a = getForwardItem(forwardMap, item.attributeName)) === null || _a === void 0 ? void 0 : _a.value.toString()) || map.get(SvgAnimationIntervalMap.getKeyName(item), item.delay) || convertToString(baseValue);
            }
            if (item.by && isNumber$2(value)) {
                value = (+value + item.by).toString();
            }
            keyTimes.unshift(0);
            values.unshift(value);
            if (keySplines) {
                keySplines.unshift(item.timingFunction);
            }
        }
        if (lastItemOf$1(keyTimes) < 1) {
            const value = map.get(SvgAnimationIntervalMap.getKeyName(item), item.delay) || convertToString(baseValueMap[item.attributeName]) || values[0];
            keyTimes.push(1);
            values.push(value);
            if (keySplines) {
                keySplines.unshift(item.timingFunction);
            }
        }
    }
    function setTransformOrigin(map, item, time, index) {
        var _a;
        if (SvgBuild.asAnimateTransform(item)) {
            const point = (_a = item.transformOrigin) === null || _a === void 0 ? void 0 : _a[index];
            if (point) {
                map.set(time, point);
            }
        }
    }
    function getForwardItem(forwardMap, attr) {
        const map = forwardMap[attr];
        return map && lastItemOf$1(map);
    }
    function setSetterValue(baseMap, item, transforming, time, value) {
        if (time === undefined) {
            time = item.delay;
        }
        if (value === undefined) {
            value = item.to;
        }
        return setTimelineValue(baseMap, time, transforming ? value : convertToAnimateValue(value));
    }
    function sortSetterData(data, item) {
        if (item) {
            data.push(item);
        }
        data.sort((a, b) => a.delay === b.delay ? a.group.id - b.group.id : a.delay - b.delay);
        for (let i = 0; i < data.length - 1; ++i) {
            if (data[i].delay === data[i + 1].delay) {
                data.splice(i--, 1);
            }
        }
    }
    function queueIncomplete(incomplete, item) {
        if (!item.hasState(8 /* COMPLETE */, 32 /* INVALID */)) {
            const index = incomplete.indexOf(item);
            if (index !== -1) {
                incomplete.splice(index, 1);
            }
            incomplete.push(item);
            item.addState(2 /* INTERRUPTED */);
        }
    }
    function sortIncomplete(incomplete, maxTime = Infinity) {
        incomplete.sort((a, b) => {
            const delayA = a.delay;
            const delayB = a.delay;
            if (maxTime !== Infinity) {
                if (maxTime === delayA && maxTime !== delayB) {
                    return -1;
                }
                else if (maxTime !== delayA && maxTime === delayB) {
                    return 1;
                }
                else if (delayA > maxTime && delayB < maxTime) {
                    return 1;
                }
                else if (delayA < maxTime && delayB > maxTime) {
                    return -1;
                }
            }
            return delayA !== delayB ? delayB - delayA : b.group.id - a.group.id;
        });
    }
    function removeIncomplete(incomplete, item) {
        if (item) {
            if (item.iterationCount !== -1) {
                spliceArray(incomplete, previous => previous === item);
            }
        }
        else {
            spliceArray(incomplete, previous => !!previous.animationElement);
        }
    }
    function sortEvaluateStart(incomplete, maxTime) {
        incomplete.sort((a, b) => {
            const durationA = a.getTotalDuration();
            if (durationA <= maxTime) {
                return 1;
            }
            const durationB = b.getTotalDuration();
            if (durationB <= maxTime) {
                return -1;
            }
            const delayA = a.delay;
            const delayB = b.delay;
            if (delayA === delayB) {
                return b.group.id - a.group.id;
            }
            else if (delayA === maxTime) {
                return -1;
            }
            else if (delayB === maxTime) {
                return 1;
            }
            else if (delayA < maxTime && delayB < maxTime) {
                return delayB - delayA;
            }
            return delayA - delayB;
        });
    }
    function refitTransformPoints(data, parent) {
        const x = data.get('x') || 0;
        const y = data.get('y') || 0;
        return parent ? parent.refitX(x) + ' ' + parent.refitX(y) : x + ' ' + y;
    }
    function insertAnimate(animations, item, repeating) {
        if (!repeating) {
            item.iterationCount = -1;
        }
        item.from = item.valueFrom;
        item.to = item.valueTo;
        animations.push(item);
    }
    function removeAnimations(animations, values) {
        if (values.length) {
            spliceArray(animations, (item) => values.includes(item));
        }
    }
    const getItemTime = (delay, duration, keyTimes, iteration, index) => Math.round(delay + (keyTimes[index] + iteration) * duration);
    const convertToString = (value) => Array.isArray(value) ? plainMap$2(value, pt => pt.x + ',' + pt.y).join(' ') : value !== undefined ? value.toString() : '';
    const isKeyTimeFormat = (transforming, keyTimeMode) => ((transforming ? 16 /* KEYTIME_TRANSFORM */ : 2 /* KEYTIME_ANIMATE */) & keyTimeMode) > 0;
    const isFromToFormat = (transforming, keyTimeMode) => ((transforming ? 8 /* FROMTO_TRANSFORM */ : 1 /* FROMTO_ANIMATE */) & keyTimeMode) > 0;
    const playableAnimation = (item) => item.playable || item.animationElement && item.duration !== -1;
    const cloneKeyTimes = (item) => { var _a; return [item.keyTimes.slice(0), item.values.slice(0), ((_a = item.keySplines) === null || _a === void 0 ? void 0 : _a.slice(0)) || null]; };
    const getStartIteration = (time, delay, duration) => Math.floor(Math.max(0, time - delay) / duration);
    var SvgSynchronize$MX = (Base) => {
        return class extends Base {
            getAnimateShape(element) {
                const result = [];
                const animations = this.animations;
                for (let i = 0, length = animations.length; i < length; ++i) {
                    const item = animations[i];
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
                const animations = this.animations;
                for (let i = 0, length = animations.length; i < length; ++i) {
                    const item = animations[i];
                    if (SvgBuild.isAnimateTransform(item) && item.duration > 0) {
                        result.push(item);
                        if (options && SvgBuild.asAnimateMotion(item)) {
                            const framesPerSecond = options.framesPerSecond;
                            if (framesPerSecond) {
                                item.framesPerSecond = framesPerSecond;
                            }
                        }
                    }
                }
                return result;
            }
            getAnimateViewRect(animations) {
                animations || (animations = this.animations);
                const result = [];
                for (let i = 0, length = animations.length; i < length; ++i) {
                    const item = animations[i];
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
                var _a, _b, _c;
                let keyTimeMode = 1 /* FROMTO_ANIMATE */ | 8 /* FROMTO_TRANSFORM */, precision;
                if (options) {
                    if (options.keyTimeMode) {
                        keyTimeMode = options.keyTimeMode;
                    }
                    precision = options.precision;
                }
                const animationsBase = this.animations;
                for (const mergeable of [animations, transforms]) {
                    const transforming = mergeable === transforms;
                    if (!mergeable || mergeable.length === 0 || !transforming && (keyTimeMode & 4 /* IGNORE_ANIMATE */) || transforming && (keyTimeMode & 32 /* IGNORE_TRANSFORM */)) {
                        continue;
                    }
                    const staggered = [];
                    const setterAttributeMap = {};
                    const groupActive = new Set();
                    let setterTotal = 0;
                    const insertSetter = (item) => {
                        var _a;
                        (setterAttributeMap[_a = item.attributeName] || (setterAttributeMap[_a] = [])).push(item);
                        ++setterTotal;
                    };
                    {
                        const excluded = [];
                        const length = mergeable.length;
                        for (let i = 0; i < length; ++i) {
                            const itemA = mergeable[i];
                            if (itemA.setterType) {
                                insertSetter(itemA);
                            }
                            else {
                                const timeA = itemA.getTotalDuration();
                                for (let j = 0; j < length; ++j) {
                                    const itemB = mergeable[j];
                                    if (i !== j && itemA.attributeName === itemB.attributeName && itemA.group.id < itemB.group.id && itemA.fillReplace && !itemB.evaluateEnd) {
                                        if (itemB.setterType) {
                                            if (itemA.delay === itemB.delay) {
                                                excluded[i] = itemA;
                                                break;
                                            }
                                        }
                                        else if (!itemB.evaluateStart && !itemB.evaluateEnd) {
                                            if (itemA.delay === itemB.delay && (!itemB.fillReplace || itemB.iterationCount === -1 || timeA <= itemB.getTotalDuration()) ||
                                                itemB.fillBackwards && itemA.delay <= itemB.delay && (itemB.fillForwards || itemA.fillReplace && timeA <= itemB.delay) ||
                                                itemA.animationElement && !itemB.animationElement && (itemA.delay >= itemB.delay && timeA <= itemB.getTotalDuration() || itemB.fillForwards)) {
                                                excluded[i] = itemA;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        const removeable = [];
                        for (let i = 0; i < length; ++i) {
                            const item = mergeable[i];
                            if (excluded[i]) {
                                if (item.fillReplace) {
                                    removeable.push(item);
                                }
                                else {
                                    item.setterType = true;
                                    insertSetter(item);
                                }
                            }
                            else if (!item.setterType) {
                                staggered.push(item);
                                groupActive.add(item.group.name);
                            }
                        }
                        removeAnimations(animationsBase, removeable);
                    }
                    if (staggered.length + setterTotal > 1 || staggered.length === 1 && (staggered[0].alternate || staggered[0].end !== undefined)) {
                        const groupName = {};
                        const groupAttributeMap = {};
                        const intervalMap = new SvgAnimationIntervalMap(mergeable);
                        const repeatingMap = {};
                        const repeatingInterpolatorMap = new Map();
                        const repeatingTransformOriginMap = transforming ? new Map() : null;
                        const repeatingMaxTime = {};
                        const repeatingAnimations = new Set();
                        const infiniteMap = {};
                        const infiniteInterpolatorMap = new Map();
                        const infiniteTransformOriginMap = transforming ? new Map() : null;
                        const baseValueMap = {};
                        const forwardMap = {};
                        const animateTimeRangeMap = new Map();
                        let repeatingDuration = 0, repeatingAsInfinite = -1, repeatingResult, infiniteResult;
                        for (let i = 0, length = staggered.length; i < length; ++i) {
                            const item = staggered[i];
                            const ordering = item.group.ordering;
                            if (ordering) {
                                spliceArray(ordering, sibling => !groupActive.has(sibling.name));
                            }
                            const attr = item.attributeName;
                            let groupData = groupName[attr];
                            if (!groupData) {
                                groupData = new Map();
                                groupName[attr] = groupData;
                                groupAttributeMap[attr] = [];
                            }
                            const delay = item.delay;
                            const group = groupData.get(delay) || [];
                            group.push(item);
                            groupAttributeMap[attr].push(item);
                            groupData.set(delay, group);
                        }
                        for (const attr in groupName) {
                            const groupDelay = new Map();
                            const groupData = groupName[attr];
                            const timeData = sortNumber$1(Array.from(groupData.keys()));
                            for (let i = 0, length = timeData.length; i < length; ++i) {
                                const delay = timeData[i];
                                const group = groupData.get(delay);
                                for (let j = 0, q = group.length; j < q; ++j) {
                                    repeatingDuration = Math.max(repeatingDuration, group[j].getTotalDuration(true));
                                }
                                groupDelay.set(delay, group.reverse());
                            }
                            groupName[attr] = groupDelay;
                            groupAttributeMap[attr].reverse();
                        }
                        for (const attr in groupName) {
                            const baseMap = new Map();
                            repeatingMap[attr] = baseMap;
                            if (!transforming) {
                                let value;
                                if (path) {
                                    value = path.getBaseValue(attr);
                                }
                                else {
                                    value = this[attr];
                                    if (value === undefined && 'getBaseValue' in this) {
                                        value = this.getBaseValue(attr);
                                    }
                                }
                                if (hasValue(value)) {
                                    baseValueMap[attr] = value;
                                }
                            }
                            const setterData = setterAttributeMap[attr] || [];
                            const groupDelay = [];
                            const groupData = [];
                            let incomplete = [];
                            for (const [delay, data] of groupName[attr]) {
                                groupDelay.push(delay);
                                groupData.push(data);
                            }
                            let maxTime = -1, actualMaxTime = 0, nextDelayTime = Infinity, baseValue, previousTransform = null, previousComplete;
                            const checkComplete = (item, nextDelay) => {
                                repeatingAnimations.add(item);
                                item.addState(8 /* COMPLETE */);
                                previousComplete = item;
                                if (item.fillForwards) {
                                    setFreezeValue(actualMaxTime, baseValue, item.type, item);
                                    const { name, ordering } = item.group;
                                    if (ordering) {
                                        const duration = item.getTotalDuration();
                                        for (let i = 0, length = ordering.length; i < length; ++i) {
                                            const previous = ordering[i];
                                            if (previous.name === name) {
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
                                            currentMaxTime = setTimelineValue(baseMap, currentMaxTime, replaceValue);
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
                            };
                            const checkSetterDelay = (delayTime, endTime) => {
                                var _a;
                                let replaceValue = (_a = getForwardItem(forwardMap, attr)) === null || _a === void 0 ? void 0 : _a.value;
                                spliceArray(setterData, set => set.delay >= delayTime && set.delay < endTime, (set) => {
                                    const to = set.to;
                                    if (set.animationElement) {
                                        removeIncomplete(incomplete);
                                    }
                                    if (incomplete.length === 0) {
                                        baseValue = to;
                                    }
                                    setFreezeValue(set.delay, to, set.type, set);
                                    if (set.delay === delayTime) {
                                        replaceValue = transforming ? to : convertToAnimateValue(to);
                                    }
                                    else {
                                        maxTime = setSetterValue(baseMap, set, transforming);
                                        actualMaxTime = set.delay;
                                    }
                                });
                                return replaceValue;
                            };
                            const checkIncomplete = (delayIndex, itemIndex) => {
                                if (incomplete.length) {
                                    spliceArray(incomplete, previous => previous.getTotalDuration() <= actualMaxTime, previous => {
                                        previous.addState(8 /* COMPLETE */);
                                        if (previous.fillForwards) {
                                            setFreezeValue(previous.getTotalDuration(), previous.valueTo, previous.type, previous);
                                            if (delayIndex !== undefined && itemIndex !== undefined) {
                                                for (let i = delayIndex, length = groupDelay.length; i < length; ++i) {
                                                    if (i !== delayIndex) {
                                                        itemIndex = -1;
                                                    }
                                                    const data = groupData[i];
                                                    for (let j = itemIndex + 1, q = data.length; j < q; ++j) {
                                                        const next = data[j];
                                                        if (previous.group.id > next.group.id) {
                                                            next.addState(8 /* COMPLETE */);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    });
                                }
                            };
                            const setFreezeValue = (time, value, type = 0, item) => {
                                if (!transforming) {
                                    value = convertToAnimateValue(value);
                                }
                                const forwardItem = getForwardItem(forwardMap, attr);
                                if (value !== '' && (!forwardItem || time >= forwardItem.time)) {
                                    (forwardMap[attr] || (forwardMap[attr] = [])).push({ key: type, value, time });
                                }
                                if (item && SvgBuild.isAnimate(item) && !item.fillReplace) {
                                    if (item.fillForwards) {
                                        spliceArray(setterData, set => set.group.id < item.group.id || set.delay < time);
                                        incomplete = [];
                                        for (let i = 0, length = groupData.length; i < length; ++i) {
                                            const group = groupData[i];
                                            for (let j = 0, q = group.length; j < q; ++j) {
                                                const next = group[j];
                                                if (next.group.id < item.group.id) {
                                                    next.addState(8 /* COMPLETE */);
                                                }
                                            }
                                        }
                                    }
                                    else if (item.fillFreeze) {
                                        removeIncomplete(incomplete);
                                    }
                                }
                            };
                            const resetTransform = (additiveSum, resetTime, value) => {
                                if (previousTransform && !additiveSum) {
                                    if (value === undefined) {
                                        value = TRANSFORM.typeAsValue(previousTransform.type);
                                    }
                                    maxTime = setTimelineValue(baseMap, resetTime, value);
                                    if (resetTime !== maxTime) {
                                        setTimeRange(animateTimeRangeMap, previousTransform.type, maxTime);
                                    }
                                }
                                previousTransform = null;
                            };
                            const backwards = groupAttributeMap[attr].find(item => item.fillBackwards);
                            if (backwards) {
                                baseValue = getItemValue(backwards, backwards.values, 0, 0);
                                maxTime = setTimelineValue(baseMap, 0, baseValue);
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
                                for (let i = 0; i < groupDelay.length; ++i) {
                                    const data = groupData[i];
                                    for (let j = 0; j < data.length; ++j) {
                                        const item = data[j];
                                        if (playing) {
                                            if (item === backwards && (i !== 0 || j !== 0)) {
                                                data.splice(j--, 1);
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
                                            data.splice(j--, 1);
                                            queueIncomplete(incomplete, item);
                                        }
                                    }
                                }
                                for (let i = 0; i < groupDelay.length; ++i) {
                                    const data = groupData[i];
                                    if (removeable.length) {
                                        for (let j = 0; j < data.length; ++j) {
                                            if (removeable.includes(data[j])) {
                                                data.splice(j--, 1);
                                            }
                                        }
                                    }
                                    if (data.length === 0) {
                                        groupData.splice(i, 1);
                                        groupDelay.splice(i--, 1);
                                    }
                                }
                                backwards.addState(1 /* BACKWARDS */);
                            }
                            if (!transforming) {
                                const value = baseValueMap[attr];
                                if (!forwardMap[attr] && value !== undefined) {
                                    setFreezeValue(0, value, 0);
                                }
                                if (baseValue === undefined) {
                                    baseValue = ((_a = getForwardItem(forwardMap, attr)) === null || _a === void 0 ? void 0 : _a.value) || value;
                                }
                            }
                            sortSetterData(setterData);
                            {
                                let previous;
                                spliceArray(setterData, set => set.delay <= groupDelay[0], set => {
                                    const fillForwards = SvgBuild.isAnimate(set) && set.fillForwards;
                                    const delay = set.delay;
                                    if (delay < groupDelay[0] && (!backwards || fillForwards)) {
                                        if (backwards && fillForwards) {
                                            setFreezeValue(delay, set.to, set.type);
                                        }
                                        else {
                                            const previousTime = delay - 1;
                                            if (!previous) {
                                                if (!baseMap.has(0)) {
                                                    const value = transforming && SvgBuild.isAnimateTransform(set) ? TRANSFORM.typeAsValue(set.type) : baseValueMap[attr];
                                                    if (value !== undefined) {
                                                        setSetterValue(baseMap, set, transforming, 0, value);
                                                        setSetterValue(baseMap, set, transforming, previousTime, value);
                                                    }
                                                }
                                                else if (!transforming) {
                                                    setSetterValue(baseMap, set, transforming, previousTime, baseValue);
                                                }
                                            }
                                            else {
                                                setSetterValue(baseMap, previous, transforming, previousTime);
                                            }
                                            maxTime = setSetterValue(baseMap, set, transforming);
                                            actualMaxTime = delay;
                                            previous = set;
                                        }
                                    }
                                });
                                if (previous) {
                                    setSetterValue(baseMap, previous, transforming, groupDelay[0] - 1);
                                }
                            }
                            attributeEnd: {
                                for (let i = 0, length = groupDelay.length; i < length; ++i) {
                                    let data = groupData[i], delay = groupDelay[i];
                                    for (let j = 0; j < data.length; ++j) {
                                        const item = data[j];
                                        if (item.hasState(8 /* COMPLETE */, 32 /* INVALID */) || item.hasState(2 /* INTERRUPTED */) && item.animationElement) {
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
                                                    item.addState(32 /* INVALID */);
                                                }
                                                else {
                                                    queueIncomplete(incomplete, item);
                                                }
                                                continue;
                                            }
                                        }
                                        else {
                                            totalDuration = delay + duration;
                                        }
                                        let iterationTotal, iterationFraction;
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
                                            maxTime = setTimelineValue(baseMap, delay - 1, baseValue);
                                            actualMaxTime = delay;
                                        }
                                        nextDelayTime = Infinity;
                                        const ordering = item.group.ordering;
                                        if (ordering && ordering.length > 1) {
                                            let checkDelay = true;
                                            for (let k = 0, q = ordering.length; k < q; ++k) {
                                                const order = ordering[k];
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
                                                    for (let k = i + 1; k < length; ++k) {
                                                        const dataA = groupData[k];
                                                        for (let l = 0, q = dataA.length; l < q; ++l) {
                                                            const next = dataA[l];
                                                            if (next.group.ordering) {
                                                                nextDelayTime = next.delay;
                                                                break nextDelay;
                                                            }
                                                            else if (next.getTotalDuration() <= totalDuration) {
                                                                if (next.fillFreeze) {
                                                                    sortSetterData(setterData, next);
                                                                }
                                                                next.addState(8 /* COMPLETE */);
                                                            }
                                                            else if (next.delay < totalDuration) {
                                                                queueIncomplete(incomplete, next);
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        else {
                                            for (let k = i + 1; k < length; ++k) {
                                                const value = groupDelay[k];
                                                if (value !== Infinity) {
                                                    const dataA = groupData[k];
                                                    if (dataA.length && !dataA.every(next => next.hasState(8 /* COMPLETE */, 32 /* INVALID */))) {
                                                        nextDelayTime = value;
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                        const actualStartTime = actualMaxTime;
                                        let startTime = maxTime + 1, maxThreadTime = Math.min(nextDelayTime, item.end || Infinity), setterInterrupt;
                                        if (item.animationElement && setterData.length) {
                                            const interruptTime = Math.min(nextDelayTime, totalDuration, maxThreadTime);
                                            if (setterInterrupt = setterData.find(set => set.delay >= actualMaxTime && set.delay <= interruptTime)) {
                                                switch (setterInterrupt.delay) {
                                                    case actualMaxTime:
                                                        baseValue = setterInterrupt.to;
                                                        setFreezeValue(actualMaxTime, baseValue, setterInterrupt.type, setterInterrupt);
                                                        if (setterInterrupt.group.id > item.group.id) {
                                                            if (transforming && previousTransform) {
                                                                resetTransform(item.additiveSum, Math.max(delay - 1, maxTime));
                                                            }
                                                            maxTime = setSetterValue(baseMap, setterInterrupt, transforming, Math.max(setterInterrupt.delay, maxTime), baseValue);
                                                            maxThreadTime = -1;
                                                        }
                                                        break;
                                                    case nextDelayTime:
                                                        setterInterrupt.addState(16 /* EQUAL_TIME */);
                                                        break;
                                                    default:
                                                        maxThreadTime = setterInterrupt.delay;
                                                        setterInterrupt.addState(16 /* EQUAL_TIME */);
                                                        break;
                                                }
                                                spliceArray(setterData, set => set !== setterInterrupt);
                                                item.addState(2 /* INTERRUPTED */);
                                            }
                                        }
                                        let complete, lastValue;
                                        if (maxThreadTime > maxTime) {
                                            if (transforming) {
                                                if (previousTransform) {
                                                    resetTransform(item.additiveSum, Math.max(delay - 1, maxTime));
                                                    startTime = maxTime + 1;
                                                }
                                                baseValue = TRANSFORM.typeAsValue(item.type);
                                                setFreezeValue(actualMaxTime, baseValue, item.type);
                                            }
                                            let parallel = delay === Infinity || (maxTime !== -1 || item.hasState(1 /* BACKWARDS */)) && !(i === 0 && j === 0) || item.hasState(4 /* RESUME */);
                                            complete = true;
                                            threadTimeExceeded: {
                                                const forwardItem = getForwardItem(forwardMap, attr);
                                                for (let k = getStartIteration(actualMaxTime, delay, duration); k < iterationTotal; ++k) {
                                                    let keyTimes, values, keySplines;
                                                    if (item.evaluateStart || item.evaluateEnd) {
                                                        [keyTimes, values, keySplines] = cloneKeyTimes(item);
                                                        const r = data.length;
                                                        if (item.evaluateStart) {
                                                            const pending = incomplete.concat(data.slice(j + 1, r)).filter(previous => previous.animationElement && previous.delay < maxThreadTime);
                                                            const s = pending.length;
                                                            if (s) {
                                                                sortEvaluateStart(pending, actualMaxTime);
                                                                [keyTimes, values, keySplines] = appendPartialKeyTimes(intervalMap, forwardMap, baseValueMap, k, item, keyTimes, values, keySplines, baseValue, pending, true);
                                                                for (let l = 0; l < s; ++l) {
                                                                    const previous = pending[l];
                                                                    if (previous.hasState(2 /* INTERRUPTED */) && data.includes(previous)) {
                                                                        queueIncomplete(incomplete, previous);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        if (item.evaluateEnd) {
                                                            if (item.getIntervalEndTime(actualMaxTime) < maxThreadTime && (incomplete.length || j < r - 1)) {
                                                                const pending = incomplete.filter(previous => previous.animationElement);
                                                                for (let l = j + 1; l < r; ++l) {
                                                                    const previous = data[l];
                                                                    if (previous.animationElement) {
                                                                        if (!pending.includes(previous)) {
                                                                            pending.push(previous);
                                                                        }
                                                                        queueIncomplete(incomplete, previous);
                                                                    }
                                                                }
                                                                if (pending.length) {
                                                                    sortIncomplete(pending, actualMaxTime);
                                                                    [keyTimes, values, keySplines] = appendPartialKeyTimes(intervalMap, forwardMap, baseValueMap, k, item, keyTimes, values, keySplines, baseValue, pending, false);
                                                                }
                                                            }
                                                        }
                                                        setStartItemValues(intervalMap, forwardMap, baseValueMap, item, baseValue, keyTimes, values, keySplines);
                                                    }
                                                    else {
                                                        ({ keyTimes, values, keySplines } = item);
                                                    }
                                                    for (let l = 0, q = keyTimes.length; l < q; ++l) {
                                                        const keyTime = keyTimes[l];
                                                        let time = -1, value = getItemValue(item, values, k, l, baseValue);
                                                        if (k === iterationTotal - 1 && iterationFraction > 0) {
                                                            if (iterationFraction === keyTime) {
                                                                iterationFraction = -1;
                                                            }
                                                            else if (l === q - 1) {
                                                                time = totalDuration;
                                                                actualMaxTime = time;
                                                                value = getItemSplitValue(iterationFraction, keyTimes[l - 1], getItemValue(item, values, k, l - 1, baseValue), keyTime, value);
                                                                iterationFraction = -1;
                                                            }
                                                            else if (iterationFraction > keyTime) {
                                                                for (let m = l + 1; m < q; ++m) {
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
                                                                complete = k === iterationTotal - 1 && l === q - 1;
                                                                actualMaxTime = time;
                                                            }
                                                            else {
                                                                const insertIntermediateValue = (splitTime) => [maxTime, lastValue] = insertSplitValue(item, actualMaxTime, baseValue, keyTimes, values, keySplines, delay, k, l, splitTime, keyTimeMode, baseMap, repeatingInterpolatorMap, repeatingTransformOriginMap);
                                                                if (delay < 0 && maxTime === -1) {
                                                                    if (time > 0) {
                                                                        actualMaxTime = 0;
                                                                        insertIntermediateValue(0);
                                                                    }
                                                                }
                                                                else if (time > maxThreadTime) {
                                                                    if (parallel && maxTime + 1 < maxThreadTime) {
                                                                        insertIntermediateValue(maxTime);
                                                                    }
                                                                    actualMaxTime = maxThreadTime;
                                                                    insertIntermediateValue(maxThreadTime + (maxThreadTime === nextDelayTime && !baseMap.has(maxThreadTime - 1) ? -1 : 0));
                                                                    complete = false;
                                                                    break threadTimeExceeded;
                                                                }
                                                                else if (parallel) {
                                                                    if (item.hasState(1 /* BACKWARDS */)) {
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
                                                        if (time > maxTime) {
                                                            if (l === length - 1 && !item.accumulateSum && (k < iterationTotal - 1 || item.fillReplace && (!forwardItem || value !== forwardItem.value))) {
                                                                --time;
                                                            }
                                                            maxTime = setTimelineValue(baseMap, time, value);
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
                                            if (setterInterrupt.hasState(16 /* EQUAL_TIME */)) {
                                                lastValue = setterInterrupt.to;
                                                maxTime = setSetterValue(baseMap, setterInterrupt, transforming, setterInterrupt.delay, lastValue);
                                                actualMaxTime = setterInterrupt.delay;
                                                setFreezeValue(actualMaxTime, lastValue, setterInterrupt.type, setterInterrupt);
                                            }
                                            else if (item.hasState(32 /* INVALID */)) {
                                                setTimeRange(animateTimeRangeMap, maxTime, setterInterrupt.type);
                                            }
                                            removeIncomplete(incomplete);
                                            complete = true;
                                        }
                                        spliceArray(setterData, set => set.delay >= actualStartTime && set.delay <= actualMaxTime, (set) => {
                                            setFreezeValue(set.delay, set.to, set.type, set);
                                            if (set.animationElement) {
                                                removeIncomplete(incomplete);
                                            }
                                        });
                                        if (infinite) {
                                            if (complete) {
                                                if (!setterInterrupt) {
                                                    infiniteMap[attr] = item;
                                                    break attributeEnd;
                                                }
                                            }
                                            else {
                                                incomplete = [item];
                                                continue;
                                            }
                                        }
                                        if (complete) {
                                            if (!infinite && checkComplete(item, nextDelayTime)) {
                                                break attributeEnd;
                                            }
                                            for (let k = i; k < length; ++k) {
                                                if (groupDelay[k] < actualMaxTime) {
                                                    const dataA = groupData[k];
                                                    for (let l = 0, q = dataA.length; l < q; ++l) {
                                                        const next = dataA[l];
                                                        const nextDuration = next.getTotalDuration();
                                                        if (nextDuration > actualMaxTime && !next.hasState(2 /* INTERRUPTED */, 8 /* COMPLETE */, 32 /* INVALID */)) {
                                                            queueIncomplete(incomplete, next);
                                                        }
                                                        else if (!next.fillReplace) {
                                                            setFreezeValue(nextDuration, next.valueTo, next.type, next);
                                                        }
                                                    }
                                                    groupDelay[k] = Infinity;
                                                    dataA.length = 0;
                                                }
                                            }
                                            if (incomplete.length && actualMaxTime < nextDelayTime) {
                                                sortIncomplete(incomplete);
                                                const resume = incomplete.find(next => next.delay <= actualMaxTime);
                                                if (resume) {
                                                    resume.removeState(2 /* INTERRUPTED */, 1 /* BACKWARDS */);
                                                    resume.addState(4 /* RESUME */);
                                                    removeIncomplete(incomplete, resume);
                                                    delay = resume.delay;
                                                    data = [resume];
                                                    j = -1;
                                                }
                                            }
                                        }
                                        else {
                                            queueIncomplete(incomplete, item);
                                        }
                                    }
                                }
                                if (incomplete.length) {
                                    sortIncomplete(incomplete);
                                    while (incomplete.length) {
                                        const item = incomplete.shift();
                                        const { delay, duration } = item;
                                        const durationTotal = maxTime - delay;
                                        let maxThreadTime = Infinity;
                                        const insertKeyTimes = () => {
                                            let [keyTimes, values, keySplines] = cloneKeyTimes(item);
                                            const interval = getStartIteration(actualMaxTime, delay, duration);
                                            if (incomplete.length) {
                                                if (item.evaluateStart) {
                                                    const pending = incomplete.slice(0);
                                                    sortEvaluateStart(pending, actualMaxTime);
                                                    [keyTimes, values, keySplines] = appendPartialKeyTimes(intervalMap, forwardMap, baseValueMap, interval, item, keyTimes, values, keySplines, baseValue, pending, true);
                                                }
                                                if (item.evaluateEnd && item.getIntervalEndTime(actualMaxTime) < maxThreadTime) {
                                                    [keyTimes, values, keySplines] = appendPartialKeyTimes(intervalMap, forwardMap, baseValueMap, interval, item, keyTimes, values, keySplines, baseValue, incomplete, false);
                                                }
                                            }
                                            setStartItemValues(intervalMap, forwardMap, baseValueMap, item, baseValue, keyTimes, values, keySplines);
                                            const startTime = maxTime + 1;
                                            let joined = false, j = Math.floor(durationTotal / duration);
                                            const insertIntermediateValue = (index, time) => insertSplitValue(item, actualMaxTime, baseValue, keyTimes, values, keySplines, delay, j, index, time, keyTimeMode, repeatingMap[attr], repeatingInterpolatorMap, repeatingTransformOriginMap);
                                            do {
                                                for (let k = 0, q = keyTimes.length; k < q; ++k) {
                                                    let time = getItemTime(delay, duration, keyTimes, j, k);
                                                    if (!joined && time >= maxTime) {
                                                        [maxTime, baseValue] = insertIntermediateValue(k, maxTime);
                                                        joined = true;
                                                    }
                                                    if (joined) {
                                                        if (time >= maxThreadTime) {
                                                            if (maxThreadTime > maxTime) {
                                                                const fillReplace = item.fillReplace || item.iterationCount === -1;
                                                                [maxTime, baseValue] = insertIntermediateValue(k, maxThreadTime - (fillReplace ? 1 : 0));
                                                                if (fillReplace) {
                                                                    baseValue = getItemValue(item, values, j, 0, baseValue);
                                                                    maxTime = setTimelineValue(baseMap, maxThreadTime, baseValue);
                                                                }
                                                                actualMaxTime = maxThreadTime;
                                                            }
                                                        }
                                                        else if (time > maxTime) {
                                                            actualMaxTime = time;
                                                            if (k === q - 1 && time < maxThreadTime) {
                                                                --time;
                                                            }
                                                            baseValue = getItemValue(item, values, j, k, baseValue);
                                                            maxTime = setTimelineValue(baseMap, time, baseValue);
                                                            insertInterpolator(item, maxTime, keySplines, k, keyTimeMode, repeatingInterpolatorMap, repeatingTransformOriginMap);
                                                        }
                                                    }
                                                }
                                            } while (maxTime < maxThreadTime && ++j);
                                            if (transforming) {
                                                setTimeRange(animateTimeRangeMap, item.type, startTime, maxTime);
                                            }
                                        };
                                        if (item.iterationCount === -1) {
                                            if (durationTotal > 0 && durationTotal % item.duration !== 0) {
                                                maxThreadTime = delay + item.duration * Math.ceil(durationTotal / duration);
                                                insertKeyTimes();
                                            }
                                            infiniteMap[attr] = item;
                                            break attributeEnd;
                                        }
                                        else {
                                            maxThreadTime = Math.min(delay + item.duration * item.iterationCount, item.end || Infinity);
                                            if (maxThreadTime > maxTime) {
                                                insertKeyTimes();
                                                if (checkComplete(item)) {
                                                    break attributeEnd;
                                                }
                                            }
                                        }
                                    }
                                }
                                if (previousComplete && previousComplete.fillReplace && !(attr in infiniteMap)) {
                                    let key = 0, value;
                                    if (forwardMap[attr]) {
                                        const item = getForwardItem(forwardMap, attr);
                                        if (item) {
                                            ({ key, value } = item);
                                        }
                                    }
                                    else if (transforming) {
                                        key = Array.from(animateTimeRangeMap.values()).pop();
                                        value = TRANSFORM.typeAsValue(key);
                                    }
                                    else {
                                        value = baseValueMap[attr];
                                    }
                                    if (value !== undefined && !isEqual$1(baseMap.get(maxTime), value)) {
                                        maxTime = setTimelineValue(baseMap, maxTime, value);
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
                                (_b = forwardMap[attr]) === null || _b === void 0 ? void 0 : _b.sort((a, b) => a.time - b.time);
                            }
                            if (hasKeys(infiniteMap)) {
                                const delay = [];
                                const duration = [];
                                for (const attr in infiniteMap) {
                                    const item = infiniteMap[attr];
                                    delay.push(item.delay);
                                    duration.push(item.duration);
                                }
                                const start = delay[0];
                                if (repeatingAnimations.size === 0 && new Set(delay).size === 1 && new Set(duration).size === 1 && start === keyTimesRepeating.values().next().value) {
                                    repeatingAsInfinite = start;
                                }
                                else if (duration.length > 1 && duration.every(value => value % 250 === 0)) {
                                    repeatingEndTime = multipleOf$1(duration, repeatingEndTime, delay);
                                }
                                else {
                                    const end = duration[0];
                                    if ((repeatingEndTime - start) % end !== 0) {
                                        repeatingEndTime = end * Math.ceil(repeatingEndTime / end);
                                    }
                                }
                            }
                            if (repeatingAsInfinite === -1) {
                                for (const attr in repeatingMap) {
                                    const item = infiniteMap[attr];
                                    if (item) {
                                        let maxTime = repeatingMaxTime[attr];
                                        if (maxTime < repeatingEndTime) {
                                            const baseMap = repeatingMap[attr];
                                            const delay = item.delay;
                                            const startTime = maxTime + 1;
                                            let baseValue = Array.from(baseMap.values()).pop();
                                            const [keyTimesBase, values, keySplines] = cloneKeyTimes(item);
                                            setStartItemValues(intervalMap, forwardMap, baseValueMap, item, baseValue, keyTimesBase, values, keySplines);
                                            const length = keyTimesBase.length;
                                            let i = Math.floor((maxTime - delay) / item.duration);
                                            do {
                                                let joined;
                                                for (let j = 0; j < length; ++j) {
                                                    let time = getItemTime(delay, item.duration, keyTimesBase, i, j);
                                                    if (!joined && time >= maxTime) {
                                                        [maxTime, baseValue] = insertSplitValue(item, maxTime, baseValue, keyTimesBase, values, keySplines, delay, i, j, maxTime, keyTimeMode, baseMap, repeatingInterpolatorMap, repeatingTransformOriginMap);
                                                        keyTimesRepeating.add(maxTime);
                                                        joined = true;
                                                    }
                                                    if (joined && time > maxTime) {
                                                        if (j === length - 1 && time < repeatingEndTime) {
                                                            --time;
                                                        }
                                                        baseValue = getItemValue(item, values, i, j, baseValue);
                                                        maxTime = setTimelineValue(baseMap, time, baseValue);
                                                        insertInterpolator(item, time, keySplines, j, keyTimeMode, repeatingInterpolatorMap, repeatingTransformOriginMap);
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
                            const keyTimes = sortNumber$1(Array.from(keyTimesRepeating));
                            if (path || transforming) {
                                let modified;
                                for (const attr in repeatingMap) {
                                    const baseMap = repeatingMap[attr];
                                    if (!baseMap.has(0)) {
                                        const valueMap = baseValueMap[attr];
                                        if (valueMap !== undefined) {
                                            const endTime = baseMap.keys().next().value - 1;
                                            baseMap.set(0, valueMap);
                                            baseMap.set(endTime, valueMap);
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
                                }
                                if (modified) {
                                    sortNumber$1(keyTimes);
                                }
                            }
                            if (!transforming) {
                                for (const attr in repeatingMap) {
                                    const baseMap = repeatingMap[attr];
                                    const startTime = baseMap.keys().next().value;
                                    const startValue = baseMap.values().next().value;
                                    for (let i = 0, length = keyTimes.length; i < length; ++i) {
                                        const keyTime = keyTimes[i];
                                        if (keyTime <= repeatingMaxTime[attr]) {
                                            if (!baseMap.has(keyTime)) {
                                                if (intervalMap.paused(attr, keyTime)) {
                                                    if (keyTime < startTime) {
                                                        baseMap.set(keyTime, startValue);
                                                    }
                                                    else {
                                                        let value = intervalMap.get(attr, keyTime);
                                                        if (value !== undefined) {
                                                            value = convertToAnimateValue(value, true);
                                                            if (value !== '') {
                                                                baseMap.set(keyTime, value);
                                                                continue;
                                                            }
                                                        }
                                                    }
                                                }
                                                insertAdjacentSplitValue(baseMap, attr, keyTime, intervalMap, transforming);
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
                        if (repeatingAsInfinite === -1 && hasKeys(infiniteMap)) {
                            const timelineMap = {};
                            const infiniteAnimations = [];
                            const keyTimes = [];
                            const duration = [];
                            for (const attr in infiniteMap) {
                                const map = infiniteMap[attr];
                                duration.push(map.duration);
                                infiniteAnimations.push(map);
                            }
                            const maxDuration = multipleOf$1(duration);
                            for (let i = 0, length = infiniteAnimations.length; i < length; ++i) {
                                const item = infiniteAnimations[i];
                                const attr = item.attributeName;
                                timelineMap[attr] = new Map();
                                let baseValue = (_c = repeatingMap[attr].get(repeatingMaxTime[attr])) !== null && _c !== void 0 ? _c : baseValueMap[attr];
                                const [keyTimesBase, values, keySplines] = cloneKeyTimes(item);
                                setStartItemValues(intervalMap, forwardMap, baseValueMap, item, baseValue, keyTimesBase, values, keySplines);
                                const q = keyTimesBase.length;
                                let maxTime = 0, j = 0;
                                do {
                                    for (let k = 0; k < q; ++k) {
                                        let time = getItemTime(0, item.duration, keyTimesBase, j, k);
                                        if (k === keyTimesBase.length - 1 && time < maxDuration) {
                                            --time;
                                        }
                                        baseValue = getItemValue(item, values, j, k, baseValue);
                                        maxTime = setTimelineValue(timelineMap[attr], time, baseValue);
                                        insertInterpolator(item, maxTime, keySplines, k, keyTimeMode, infiniteInterpolatorMap, infiniteTransformOriginMap);
                                        if (!keyTimes.includes(maxTime)) {
                                            keyTimes.push(maxTime);
                                        }
                                    }
                                    ++j;
                                } while (maxTime < maxDuration);
                            }
                            if (infiniteAnimations.every(item => item.alternate)) {
                                let maxTime = -1;
                                for (const attr in infiniteMap) {
                                    const map = timelineMap[attr];
                                    const times = Array.from(map.keys());
                                    const values = Array.from(map.values()).reverse();
                                    for (let i = 0, length = times.length; i < length; ++i) {
                                        const value = times[i];
                                        if (value !== 0) {
                                            maxTime = maxDuration + value;
                                            const interpolator = infiniteInterpolatorMap.get(value);
                                            if (interpolator) {
                                                infiniteInterpolatorMap.set(maxTime, interpolator);
                                            }
                                            maxTime = setTimelineValue(map, maxTime, values[i]);
                                            if (!keyTimes.includes(maxTime)) {
                                                keyTimes.push(maxTime);
                                            }
                                        }
                                    }
                                }
                            }
                            sortNumber$1(keyTimes);
                            for (const attr in timelineMap) {
                                const map = timelineMap[attr];
                                for (let i = 0, length = keyTimes.length; i < length; ++i) {
                                    const time = keyTimes[i];
                                    if (!map.has(time)) {
                                        insertAdjacentSplitValue(map, attr, time, intervalMap, transforming);
                                    }
                                }
                            }
                            infiniteResult = createKeyTimeMap(timelineMap, keyTimes, forwardMap);
                        }
                        if (repeatingResult || infiniteResult) {
                            removeAnimations(animationsBase, staggered);
                            const timeRange = Array.from(animateTimeRangeMap);
                            const synchronizedName = joinArray$1(staggered, item => SvgBuild.isAnimateTransform(item) ? TRANSFORM.typeAsName(item.type) : item.attributeName, '-');
                            const parent = this.parent;
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
                                                const entries = Array.from(result);
                                                let type = timeRange[0][1];
                                                for (let i = 0, j = 0, k = 0, length = timeRange.length; i < length; ++i) {
                                                    const next = i < length - 1 ? timeRange[i + 1][1] : -1;
                                                    if (type !== next) {
                                                        const map = new Map();
                                                        for (let l = k, q = entries.length; l < q; ++l) {
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
                                                const map = new Map();
                                                for (const [time, item] of result) {
                                                    map.set(time, new Map([[infiniteMap['transform'].type, item.values().next().value]]));
                                                }
                                                transformMap.push(map);
                                            }
                                            else {
                                                continue;
                                            }
                                            let previousEndTime = 0;
                                            for (let i = 0, length = transformMap.length; i < length; ++i) {
                                                const entries = Array.from(transformMap[i]);
                                                const items = entries[0];
                                                let delay = items[0];
                                                const value = items[1];
                                                if (entries.length === 1) {
                                                    if (i < length - 1) {
                                                        entries.push([transformMap[i + 1].keys().next().value, value]);
                                                    }
                                                    else {
                                                        entries.push([delay + 1, value]);
                                                    }
                                                }
                                                const q = entries.length;
                                                const endTime = entries[q - 1][0];
                                                let duration = endTime - delay;
                                                const animate = new SvgAnimateTransform();
                                                animate.type = value.keys().next().value;
                                                for (let j = 0; j < q; ++j) {
                                                    const entry = entries[j];
                                                    keySplines.push(interpolatorMap.get(entry[0]) || '');
                                                    if (animate.type !== SVGTransform.SVG_TRANSFORM_ROTATE) {
                                                        const transformOrigin = transformOriginMap.get(entry[0]);
                                                        if (transformOrigin) {
                                                            (animate.transformOrigin || (animate.transformOrigin = []))[j] = transformOrigin;
                                                        }
                                                    }
                                                    entry[0] -= delay;
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
                                                    ++duration;
                                                }
                                                animate.duration = duration;
                                                animate.keySplines = keySplines;
                                                animate.synchronized = { key: i, value: '' };
                                                previousEndTime = endTime;
                                                insertAnimate(animationsBase, animate, repeating);
                                            }
                                        }
                                        else {
                                            const entries = Array.from(result);
                                            const delay = repeatingAsInfinite !== -1 ? repeatingAsInfinite : 0;
                                            let object;
                                            for (let i = 0, q = entries.length; i < q; ++i) {
                                                const item = entries[i];
                                                keySplines.push(interpolatorMap.get(item[0]) || '');
                                                item[0] -= delay;
                                            }
                                            if (path) {
                                                const pathData = getPathData(convertToFraction(entries), path, parent, forwardMap, precision);
                                                if (pathData) {
                                                    object = new SvgAnimate();
                                                    object.attributeName = 'd';
                                                    for (let i = 0, q = pathData.length; i < q; ++i) {
                                                        const item = pathData[i];
                                                        object.keyTimes.push(item.key);
                                                        object.values.push(item.value.toString());
                                                    }
                                                }
                                                else {
                                                    continue;
                                                }
                                            }
                                            else {
                                                const animate = new SvgAnimateTransform();
                                                animate.type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                                                for (const [keyTime, data] of result) {
                                                    const x = data.get('x') || 0;
                                                    const y = data.get('y') || 0;
                                                    animate.keyTimes.push(keyTime);
                                                    animate.values.push(parent ? parent.refitX(x) + ' ' + parent.refitX(y) : x + ' ' + y);
                                                }
                                                object = animate;
                                            }
                                            object.delay = delay;
                                            object.keySplines = keySplines;
                                            object.duration = lastItemOf$1(entries)[0];
                                            insertAnimate(animationsBase, object, repeating);
                                        }
                                    }
                                    else if (isFromToFormat(transforming, keyTimeMode)) {
                                        const entries = Array.from(result);
                                        for (let i = 0, length = entries.length - 1; i < length; ++i) {
                                            const [keyTimeFrom, dataFrom] = entries[i];
                                            const [keyTimeTo, dataTo] = entries[i + 1];
                                            let value = synchronizedName, object;
                                            if (transforming) {
                                                const animate = new SvgAnimateTransform();
                                                if (repeating) {
                                                    for (let j = 0, q = timeRange.length - 1; j < q; ++j) {
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
                                            else if (path) {
                                                const pathData = getPathData([[keyTimeFrom, dataFrom], [keyTimeTo, dataTo]], path, parent, forwardMap, precision);
                                                if (pathData) {
                                                    object = new SvgAnimate();
                                                    object.attributeName = 'd';
                                                    object.values = replaceMap$1(pathData, item => item.value.toString());
                                                }
                                                else {
                                                    continue;
                                                }
                                            }
                                            else {
                                                const animate = new SvgAnimateTransform();
                                                animate.type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                                                animate.values = [refitTransformPoints(dataFrom, parent), refitTransformPoints(dataTo, parent)];
                                                value += i;
                                                object = animate;
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
                                            insertAnimate(animationsBase, object, repeating);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
    };

    const { isPercent: isPercent$1, parseAngle: parseAngle$1 } = squared.lib.css;
    const { getNamedItem: getNamedItem$4 } = squared.lib.dom;
    const { truncateFraction: truncateFraction$1 } = squared.lib.math;
    const { convertPercent: convertPercent$3, isEqual, isNumber: isNumber$1, iterateArray: iterateArray$2, lastItemOf, plainMap: plainMap$1 } = squared.lib.util;
    const equalPoint = (item, time, point, rotate) => item && item.key === time && item.rotate === rotate && isEqual(item.value, point);
    class SvgAnimateMotion extends SvgAnimateTransform {
        constructor(element, animationElement) {
            super(element, animationElement);
            this.path = '';
            this.distance = '0%';
            this.rotate = 'auto 0deg';
            this.motionPathElement = null;
            this.type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
            this.instanceType = 229384 /* SVG_ANIMATE_MOTION */;
            this._offsetLength = 0;
            this._keyPoints = [];
            this._offsetPath = null;
            if (animationElement) {
                this.setAttribute('path');
                const rotate = getNamedItem$4(animationElement, 'rotate');
                switch (rotate) {
                    case 'auto':
                        break;
                    case 'auto-reverse':
                        this.rotate = 'auto 180deg';
                        break;
                    default:
                        if (isNumber$1(rotate)) {
                            this.rotate = +rotate + 'deg';
                        }
                        break;
                }
                iterateArray$2(animationElement.children, (item) => {
                    if (item.tagName === 'mpath') {
                        let target = getTargetElement(item);
                        if (target) {
                            if (SVG.use(target)) {
                                target = getTargetElement(target);
                            }
                            if (target && SVG.shape(target)) {
                                this.motionPathElement = target;
                                return true;
                            }
                        }
                    }
                });
                this.setCalcMode();
            }
            else if (element) {
                const path = /path\("([^"]+)"\)/.exec(getAttribute(element, 'offset-path'));
                if (path) {
                    this.path = path[1];
                }
                const distance = getAttribute(element, 'offset-distance');
                if (distance) {
                    this.distance = distance;
                }
                const rotate = getAttribute(element, 'offset-rotate');
                if (rotate && rotate !== 'auto') {
                    this.rotate = rotate;
                }
            }
        }
        setCalcMode() {
            const animationElement = this.animationElement;
            if (animationElement) {
                const mode = getNamedItem$4(animationElement, 'calcMode') || 'paced';
                switch (mode) {
                    case 'paced':
                    case 'discrete':
                    case 'spline':
                        super.setCalcMode('translate', mode);
                        break;
                    case 'linear': {
                        const keyPoints = SvgAnimateTransform.toFractionList(getNamedItem$4(animationElement, 'keyPoints'), ';', false);
                        let keyTimes = super.keyTimes;
                        if (keyTimes.length === 0 && this.duration !== -1) {
                            keyTimes = SvgAnimateTransform.toFractionList(getNamedItem$4(animationElement, 'keyTimes'));
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
        }
        addKeyPoint(item) {
            if (!this._offsetPath) {
                const key = item.key;
                if (key >= 0 && key <= 1) {
                    const keyTimes = super.keyTimes;
                    const keyPoints = this._keyPoints;
                    if (keyTimes.length === keyPoints.length) {
                        const value = item.value;
                        let distance = isPercent$1(value) ? convertPercent$3(value) : parseFloat(value) / this.offsetLength;
                        if (!isNaN(distance)) {
                            distance = Math.min(distance, 1);
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
            if (!this._offsetPath && this.path) {
                let offsetPath = SvgBuild.toOffsetPath(this.path, this.rotate), distance = offsetPath.length;
                if (distance) {
                    const { duration, keyPoints, rotateData, framesPerSecond } = this;
                    let increment = 1;
                    if (duration >= distance) {
                        increment = duration / distance;
                        const length = distance - 1;
                        for (let i = 1; i < length; ++i) {
                            offsetPath[i].key *= increment;
                        }
                        offsetPath[length].key = duration;
                    }
                    else if (duration > 0) {
                        const result = new Array(duration);
                        const j = distance / duration;
                        let item;
                        for (let i = 0; i < duration; ++i) {
                            item = offsetPath[Math.floor(i * j)];
                            item.key = i;
                            result[i] = item;
                        }
                        const end = lastItemOf(offsetPath);
                        if (item.value !== end.value) {
                            end.key = duration;
                            result.push(end);
                        }
                        offsetPath = result;
                        distance = result.length;
                    }
                    const fps = framesPerSecond ? 1000 / framesPerSecond : 0;
                    if (keyPoints.length) {
                        const length = distance - 1;
                        const keyTimes = super.keyTimes;
                        const result = [];
                        if (keyPoints.length > 1) {
                            let previous;
                            for (let i = 0, q = keyTimes.length - 1; i < q; ++i) {
                                const keyTime = keyTimes[i];
                                const baseTime = truncateFraction$1(keyTime * duration);
                                const offsetDuration = truncateFraction$1((keyTimes[i + 1] - keyTime) * duration);
                                const from = keyPoints[i];
                                const to = keyPoints[i + 1];
                                if (offsetDuration === 0) {
                                    const key = baseTime;
                                    const { value, rotate } = offsetPath[Math.floor(to * length)];
                                    if (!equalPoint(previous, key, value, rotate)) {
                                        previous = { key, value, rotate };
                                        result.push(previous);
                                    }
                                }
                                else {
                                    let nextFrame = baseTime, j = 0;
                                    if (from === to) {
                                        const { value, rotate } = offsetPath[Math.floor(from * length)];
                                        if (equalPoint(previous, baseTime, value, rotate)) {
                                            j += increment;
                                            nextFrame += fps;
                                        }
                                        for (; j < offsetDuration; j += increment) {
                                            const key = baseTime + j;
                                            if (key >= nextFrame) {
                                                result.push({ key, value, rotate });
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
                                        for (let k = minTime; k <= maxTime; ++k) {
                                            partial.push(offsetPath[k]);
                                        }
                                        if (from > to) {
                                            partial.reverse();
                                        }
                                        const r = partial.length;
                                        const offsetInterval = offsetDuration / r;
                                        const item = partial[0];
                                        if (equalPoint(previous, baseTime, item.value, item.rotate)) {
                                            ++j;
                                            nextFrame += fps;
                                        }
                                        for (; j < r; ++j) {
                                            const key = baseTime + (j * offsetInterval);
                                            if (key >= nextFrame) {
                                                const next = partial[j];
                                                next.key = key;
                                                result.push(next);
                                                if (j < r - 1) {
                                                    nextFrame += fps;
                                                }
                                                else {
                                                    nextFrame = 0;
                                                }
                                            }
                                        }
                                    }
                                    lastItemOf(result).key = baseTime + offsetDuration;
                                }
                            }
                        }
                        else {
                            result.push(offsetPath[Math.floor(keyPoints[0] * length)]);
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
                        const end = lastItemOf(offsetPath);
                        if (lastItemOf(result) !== end) {
                            result.push(end);
                        }
                        this._offsetPath = result;
                    }
                    else {
                        this._offsetPath = offsetPath;
                    }
                    if (rotateData) {
                        offsetPath = this._offsetPath;
                        for (let i = 0, j = 0, q = rotateData.length - 1; i < q; ++i) {
                            const from = rotateData[i];
                            const to = rotateData[i + 1];
                            const toKey = to.key;
                            const timeRange = [];
                            if (from.key === toKey) {
                                timeRange.push(offsetPath[j++]);
                            }
                            else {
                                const maxTime = Math.floor(truncateFraction$1(toKey * duration));
                                do {
                                    const item = offsetPath[j];
                                    if (item && item.key <= maxTime) {
                                        timeRange.push(item);
                                    }
                                    else {
                                        break;
                                    }
                                } while (++j);
                            }
                            const fromValue = from.value;
                            const toValue = to.value;
                            const angleFrom = parseAngle$1(lastItemOf(fromValue.split(' ')));
                            const angleTo = parseAngle$1(lastItemOf(toValue.split(' ')));
                            if (isNaN(angleFrom) || isNaN(angleTo)) {
                                continue;
                            }
                            const autoValue = fromValue.startsWith('auto');
                            if (fromValue === toValue || angleFrom === angleTo) {
                                const r = timeRange.length;
                                if (autoValue) {
                                    if (angleFrom !== 0) {
                                        for (let k = 0; k < r; ++k) {
                                            timeRange[k].rotate += angleFrom;
                                        }
                                    }
                                }
                                else {
                                    for (let k = 0; k < r; ++k) {
                                        timeRange[k].rotate = angleFrom;
                                    }
                                }
                            }
                            else {
                                const offset = angleTo - angleFrom;
                                const length = timeRange.length - 1;
                                const l = offset / length;
                                if (autoValue) {
                                    for (let k = 0; k < length; ++k) {
                                        timeRange[k].rotate += angleFrom + (k * l);
                                    }
                                    timeRange[length].rotate += angleFrom + offset;
                                }
                                else {
                                    for (let k = 0; k < length; ++k) {
                                        timeRange[k].rotate = angleFrom + (k * l);
                                    }
                                    timeRange[length].rotate = angleFrom + offset;
                                }
                            }
                        }
                    }
                    this.keySplines = null;
                    this.timingFunction = SvgAnimateTransform.KEYSPLINE_NAME.linear;
                }
            }
        }
        reverseKeyPoints() {
            let keyTimes, keyPoints;
            if (this.validKeyPoints()) {
                keyPoints = this._keyPoints.slice(0).reverse();
                keyTimes = plainMap$1(super.keyTimes, value => 1 - value).reverse();
            }
            return { keyTimes, keyPoints };
        }
        validKeyPoints() {
            const keyPoints = this.keyPoints;
            return keyPoints.length > 0 && keyPoints.length === super.keyTimes.length;
        }
        set keyTimes(value) {
            if (!this.path) {
                super.keyTimes = value;
            }
        }
        get keyTimes() {
            this.setOffsetPath();
            const path = this._offsetPath;
            if (path) {
                const duration = this.duration;
                return plainMap$1(path, item => item.key / duration);
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
            return this._offsetPath ? plainMap$1(this._offsetPath, item => `${item.value.x} ${item.value.y}`) : super.values;
        }
        set reverse(value) {
            if (value !== this._reverse) {
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
            return this._reverse;
        }
        set alternate(value) {
            const iterationCount = this.iterationCount;
            if (value !== this._alternate && (iterationCount === -1 || iterationCount > 1)) {
                const { keyTimes, keyPoints } = this.reverseKeyPoints();
                if (keyTimes && keyPoints) {
                    const keyTimesBase = super.keyTimes.slice(0);
                    const keyPointsBase = this.keyPoints.slice(0);
                    const length = keyTimesBase.length;
                    if (iterationCount === -1) {
                        for (let i = 0; i < length; ++i) {
                            keyTimesBase[i] /= 2;
                            keyTimes[i] = 0.5 + keyTimes[i] / 2;
                        }
                        keyTimesBase.push(...keyTimes);
                        keyPointsBase.push(...keyPoints);
                        this.duration *= 2;
                    }
                    else {
                        for (let i = 0; i < iterationCount; ++i) {
                            if (i === 0) {
                                for (let j = 0; j < length; ++j) {
                                    keyTimesBase[j] /= iterationCount;
                                }
                            }
                            else {
                                const baseTime = i * (1 / iterationCount);
                                const keyTimesAppend = i % 2 === 0 ? super.keyTimes.slice(0) : keyTimes.slice(0);
                                for (let j = 0; j < length; ++j) {
                                    keyTimesAppend[j] = truncateFraction$1(baseTime + keyTimesAppend[j] / iterationCount);
                                }
                                keyTimesBase.push(...keyTimesAppend);
                                keyPointsBase.push(...i % 2 === 0 ? this.keyPoints.slice(0) : keyPoints);
                            }
                        }
                        this.duration = this.duration * iterationCount;
                        this.iterationCount = 1;
                    }
                    this._keyTimes = keyTimesBase;
                    this._keyPoints = keyPointsBase;
                    this._alternate = value;
                }
            }
        }
        get alternate() {
            return this._alternate;
        }
        set parent(value) {
            this._parent = value;
            const container = this.parentContainer;
            if (container && container.requireRefit && this.path) {
                this.path = SvgBuild.transformRefit(this.path, { container });
            }
        }
        get parent() {
            return this._parent;
        }
        get offsetPath() {
            return this._offsetPath;
        }
        get playable() {
            return !this.paused && this.duration !== -1 && !!this.path;
        }
        get rotateValues() {
            this.setOffsetPath();
            return this._offsetPath && plainMap$1(this._offsetPath, item => item.rotate);
        }
        get keyPoints() {
            return this._keyPoints;
        }
        get offsetLength() {
            return this._offsetLength === 0 && this.path ? getPathLength(this.path) : this._offsetLength;
        }
    }

    var Pattern = squared.lib.base.Pattern;
    const { STRING: STRING$1 } = squared.lib.regex;
    const { hasCalc: hasCalc$1, isAngle, isCustomProperty: isCustomProperty$1, getKeyframesRules: getKeyframesRules$1, parseAngle, parseVar: parseVar$1 } = squared.lib.css;
    const { getNamedItem: getNamedItem$3 } = squared.lib.dom;
    const { convertCamelCase: convertCamelCase$1, convertPercent: convertPercent$2, convertWord, iterateArray: iterateArray$1, replaceMap, sortNumber, splitEnclosing, splitPairEnd, spliceString, startsWith: startsWith$1 } = squared.lib.util;
    const RE_TIMINGFUNCTION = new Pattern(`(ease|ease-(?:in|out|in-out)|linear|step-(?:start|end)|steps\\(\\d+,\\s*(?:start|end|jump-(?:start|end|both|none))\\)|cubic-bezier\\(${PATTERN_CUBICBEZIER}\\))\\s*,?`);
    const REGEXP_PERCENT = new RegExp(STRING$1.PERCENT, 'g');
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
            const result = [];
            RE_TIMINGFUNCTION.matcher(value);
            while (RE_TIMINGFUNCTION.find()) {
                result.push(RE_TIMINGFUNCTION.group(1));
            }
            return result;
        }
        return value.split(/\s*,\s*/);
    }
    function convertRotate(value) {
        if (startsWith$1(value, 'reverse')) {
            const angle = splitPairEnd(value, ' ', true);
            return `auto ${angle ? isAngle(angle) ? 180 + parseAngle(angle, 0) : '0' : '180'}deg`;
        }
        return value;
    }
    function getKeyframeOrigin(attrData, element, order) {
        var _a;
        const origin = (_a = attrData['transform-origin']) === null || _a === void 0 ? void 0 : _a.find(item => item.key === order);
        if (origin) {
            return TRANSFORM.origin(element, origin.value);
        }
    }
    function getTextContent(element, attr, lang) {
        var _a;
        if (lang) {
            const child = element.querySelector(`:scope > ${attr}[lang="${lang}"]`);
            if (child) {
                return child.textContent.trim() || '';
            }
        }
        return ((_a = element.querySelector(`:scope > ${attr}`)) === null || _a === void 0 ? void 0 : _a.textContent.trim()) || '';
    }
    const sortAttribute = (value) => value.sort((a, b) => a.key - b.key);
    var SvgView$MX = (Base) => {
        return class extends Base {
            constructor() {
                super(...arguments);
                this.transformed = null;
                this._transforms = null;
                this._animations = null;
                this._name = null;
            }
            getTransforms(element = this.element) {
                return SvgBuild.filterTransforms(TRANSFORM.parse(element) || SvgBuild.convertTransforms(element.transform.baseVal));
            }
            getAnimations(element = this.element) {
                var _a, _b, _c, _d;
                const result = [];
                let id = 0;
                const addAnimation = (item, delay, name = '') => {
                    if (!name) {
                        ++id;
                    }
                    item.delay = delay;
                    item.group = { id, name };
                    item.parent = this;
                    result.push(item);
                };
                iterateArray$1(element.children, (item) => {
                    var _a;
                    if (item instanceof SVGAnimationElement) {
                        const begin = getNamedItem$3(item, 'begin');
                        const times = begin ? sortNumber(replaceMap(begin.split(';'), value => SvgAnimation.parseClockTime(value)).filter(value => !isNaN(value))) : [0];
                        if (times.length === 0) {
                            return;
                        }
                        const precision = (_a = this.viewport) === null || _a === void 0 ? void 0 : _a.precision;
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
                                        animate.transformFrom = SvgBuild.drawRefit(element, this.parent, precision);
                                    }
                                    addAnimation(animate, time);
                                }
                                break;
                            case 'animateMotion':
                                for (const time of times) {
                                    const animate = new SvgAnimateMotion(element, item);
                                    const motionPathElement = animate.motionPathElement;
                                    if (motionPathElement) {
                                        animate.path = SvgBuild.drawRefit(motionPathElement, this.parent, precision);
                                    }
                                    addAnimation(animate, time);
                                }
                                break;
                        }
                    }
                });
                const animationName = parseAttribute(element, 'animation-name');
                const length = animationName.length;
                if (length === 0) {
                    return result;
                }
                const keyframesMap = ((_a = this.viewport) === null || _a === void 0 ? void 0 : _a.keyframesMap) || getKeyframesRules$1();
                const cssData = {};
                const groupName = [];
                const groupOrdering = [];
                for (const name in ANIMATION_DEFAULT) {
                    const values = parseAttribute(element, name);
                    if (values.length === 0) {
                        values.push(ANIMATION_DEFAULT[name]);
                    }
                    while (values.length < length) {
                        values.push(...values.slice(0));
                    }
                    values.length = length;
                    cssData[name] = values;
                }
                for (let i = 0; i < length; ++i) {
                    const keyframes = keyframesMap.get(animationName[i]);
                    const duration = SvgAnimation.parseClockTime(cssData['animation-duration'][i]);
                    if (keyframes && !isNaN(duration) && duration > 0) {
                        ++id;
                        const attrData = {};
                        const keyframeData = {};
                        const paused = cssData['animation-play-state'][i] === 'paused';
                        const delay = SvgAnimation.parseClockTime(cssData['animation-delay'][i]) || 0;
                        const iterationCount = cssData['animation-iteration-count'][i];
                        const fillMode = cssData['animation-fill-mode'][i];
                        const keyframeIndex = animationName[i] + '_' + i;
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
                            const key = convertPercent$2(percent);
                            const data = keyframes[percent];
                            for (const attr in data) {
                                let value = data[attr];
                                if (value.indexOf('%') !== -1) {
                                    const segments = splitEnclosing(value);
                                    let match;
                                    for (let j = 0; j < segments.length; j += 2) {
                                        let current = segments[j];
                                        while (match = REGEXP_PERCENT.exec(current)) {
                                            const calc = `calc(${match[0]})`;
                                            current = spliceString(current, match.index, match[0].length, calc);
                                            REGEXP_PERCENT.lastIndex = match.index + calc.length;
                                        }
                                        segments[j] = current;
                                        REGEXP_PERCENT.lastIndex = 0;
                                    }
                                    value = segments.join('');
                                }
                                if (hasCalc$1(value)) {
                                    value = calculateStyle(element, convertCamelCase$1(attr), value);
                                }
                                else if (isCustomProperty$1(value)) {
                                    value = parseVar$1(element, value);
                                }
                                if (value) {
                                    const map = ANIMATION_DEFAULT[attr] ? keyframeData : attrData;
                                    (map[attr] || (map[attr] = [])).push({ key, value });
                                }
                            }
                        }
                        if (attrData['transform']) {
                            const transforms = sortAttribute(attrData['transform']);
                            for (let j = 0, q = transforms.length; j < q; ++j) {
                                const transform = transforms[j];
                                const key = transform.key;
                                const origin = getKeyframeOrigin(attrData, element, key) || TRANSFORM.origin(element);
                                (_b = TRANSFORM.parse(element, transform.value)) === null || _b === void 0 ? void 0 : _b.forEach(item => {
                                    const m = item.matrix;
                                    let name, value, transformOrigin;
                                    switch (item.type) {
                                        case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                                            name = 'translate';
                                            value = m.e + ' ' + m.f;
                                            break;
                                        case SVGTransform.SVG_TRANSFORM_SCALE:
                                            name = 'scale';
                                            value = m.a + ' ' + m.d + ' ' + (origin ? origin.x + ' ' + origin.y : '0 0');
                                            if (origin && (key !== 0 || origin.x !== 0 || origin.y !== 0)) {
                                                transformOrigin = {
                                                    x: origin.x * (1 - m.a),
                                                    y: origin.y * (1 - m.d)
                                                };
                                            }
                                            break;
                                        case SVGTransform.SVG_TRANSFORM_ROTATE:
                                            name = 'rotate';
                                            value = item.angle + ' ' + (origin ? origin.x + ' ' + origin.y : '0 0');
                                            break;
                                        case SVGTransform.SVG_TRANSFORM_SKEWX:
                                            name = 'skewX';
                                            value = item.angle.toString();
                                            if (origin && (key !== 0 || origin.y !== 0)) {
                                                transformOrigin = {
                                                    x: origin.y * m.c * -1,
                                                    y: 0
                                                };
                                            }
                                            break;
                                        case SVGTransform.SVG_TRANSFORM_SKEWY:
                                            name = 'skewY';
                                            value = item.angle.toString();
                                            if (origin && (key !== 0 || origin.x !== 0)) {
                                                transformOrigin = {
                                                    x: 0,
                                                    y: origin.x * m.b * -1
                                                };
                                            }
                                            break;
                                        default:
                                            return;
                                    }
                                    const itemData = attrData[name] || (attrData[name] = []);
                                    const index = itemData.findIndex(previous => previous.key === key);
                                    if (index !== -1) {
                                        const indexData = itemData[index];
                                        indexData.value = value;
                                        indexData.transformOrigin = transformOrigin;
                                    }
                                    else {
                                        itemData.push({
                                            key,
                                            value,
                                            transformOrigin
                                        });
                                    }
                                });
                            }
                            delete attrData['transform'];
                            delete attrData['transform-origin'];
                        }
                        if (getAttribute(element, 'offset-path') === 'none') {
                            delete attrData['offset-distance'];
                            delete attrData['offset-rotate'];
                        }
                        else if (attrData['offset-rotate']) {
                            const offsetRotate = attrData['offset-rotate'];
                            if (attrData['offset-distance'] || !attrData['rotate']) {
                                let rotate = getAttribute(element, 'offset-rotate');
                                if (!rotate || rotate === 'auto') {
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
                                for (let j = 1; j < offsetRotate.length; ++j) {
                                    const previous = offsetRotate[j - 1];
                                    const item = offsetRotate[j];
                                    const previousValue = convertRotate(previous.value);
                                    const itemValue = convertRotate(item.value);
                                    previous.value = previousValue;
                                    item.value = itemValue;
                                    if (previousValue.split(' ').pop() !== itemValue.split(' ').pop()) {
                                        const previousAuto = startsWith$1(previousValue, 'auto');
                                        const auto = startsWith$1(itemValue, 'auto');
                                        if (previousAuto && !auto || !previousAuto && auto) {
                                            const key = (previous.key + item.key) / 2;
                                            offsetRotate.splice(j++, 0, { key, value: previousValue });
                                            offsetRotate.splice(j++, 0, { key, value: itemValue });
                                        }
                                    }
                                }
                                if (!attrData['offset-distance']) {
                                    const animate = new SvgAnimateMotion(element);
                                    animate.duration = 0;
                                    animate.iterationCount = 1;
                                    animate.fillForwards = true;
                                    animate.addKeyPoint({ key: 0, value: animate.distance });
                                    addAnimation(animate, delay, keyframeIndex);
                                    for (let j = 0, q = offsetRotate.length; j < q; ++j) {
                                        const item = offsetRotate[j];
                                        item.value = (parseAngle(item.value.split(' ').pop(), 0) + (startsWith$1(item.value, 'auto') ? 90 : 0)) + ' 0 0';
                                    }
                                    attrData['rotate'] = offsetRotate;
                                    delete attrData['offset-rotate'];
                                    includeKeySplines = false;
                                }
                            }
                            else {
                                delete attrData['offset-rotate'];
                            }
                        }
                        for (const name in attrData) {
                            let animate;
                            switch (name) {
                                case 'offset-rotate':
                                    continue;
                                case 'offset-distance':
                                    animate = new SvgAnimateMotion(element);
                                    animate.rotateData = attrData['offset-rotate'];
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
                            const animation = attrData[name];
                            const direction = cssData['animation-direction'][i];
                            const timingFunction = cssData['animation-timing-function'][i];
                            const q = animation.length;
                            sortAttribute(animation);
                            if (name === 'offset-distance') {
                                const animateMotion = animate;
                                if (animation[0].key !== 0) {
                                    animateMotion.addKeyPoint({ key: 0, value: animateMotion.distance });
                                }
                                for (let j = 0; j < q; ++j) {
                                    animateMotion.addKeyPoint(animation[j]);
                                }
                                if (animation.pop().key !== 1) {
                                    animateMotion.addKeyPoint({ key: 1, value: animateMotion.distance });
                                }
                                if (timingFunction) {
                                    animateMotion.timingFunction = timingFunction;
                                }
                            }
                            else {
                                attributes.push(name);
                                const keySplines = [];
                                const keyTimes = new Array(q);
                                const values = new Array(q);
                                for (let j = 0; j < q; ++j) {
                                    const item = animation[j];
                                    const { key, value } = item;
                                    keyTimes[j] = key;
                                    values[j] = value;
                                    if (includeKeySplines && j < q - 1) {
                                        keySplines.push(((_d = (_c = keyframeData['animation-timing-function']) === null || _c === void 0 ? void 0 : _c.find(timing => timing.key === key)) === null || _d === void 0 ? void 0 : _d.value) || timingFunction);
                                    }
                                    const transformOrigin = item.transformOrigin;
                                    if (transformOrigin && SvgBuild.asAnimateTransform(animate)) {
                                        (animate.transformOrigin || (animate.transformOrigin = []))[j] = transformOrigin;
                                    }
                                }
                                if (includeKeySplines && !keySplines.every(value => value === 'linear')) {
                                    const keyTimesData = [];
                                    const valuesData = [];
                                    const keySplinesData = [];
                                    for (let j = 0, r = keyTimes.length; j < r; ++j) {
                                        const time = keyTimes[j];
                                        const value = values[j];
                                        if (j < r - 1) {
                                            const keySpline = keySplines[j];
                                            if (value && startsWith$1(keySpline, 'step')) {
                                                const stepData = SvgAnimate.fromStepTimingFunction(element, name, keySpline, keyTimes, values, j);
                                                if (stepData) {
                                                    const [stepTime, stepValue] = stepData;
                                                    const stepDuration = (keyTimes[j + 1] - time) * duration;
                                                    const s = stepTime.length - (keyTimes[j + 1] === 1 ? 1 : 0);
                                                    for (let k = 0; k < s; ++k) {
                                                        let keyTime = (time + stepTime[k] * stepDuration) / duration;
                                                        if (keyTimesData.includes(keyTime)) {
                                                            keyTime += 1 / 1000;
                                                        }
                                                        keyTimesData.push(keyTime);
                                                        valuesData.push(stepValue[k]);
                                                        keySplinesData.push(SvgAnimate.KEYSPLINE_NAME[keySpline.includes('start') ? 'step-start' : 'step-end']);
                                                    }
                                                    continue;
                                                }
                                            }
                                            keySplinesData.push(SvgAnimate.findTimingFunction(keySpline));
                                        }
                                        keyTimesData.push(time);
                                        valuesData.push(value);
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
                            animate.iterationCount = iterationCount !== 'infinite' ? +iterationCount : -1;
                            animate.fillForwards = fillMode === 'forwards' || fillMode === 'both';
                            animate.fillBackwards = fillMode === 'backwards' || fillMode === 'both';
                            animate.reverse = direction.endsWith('reverse');
                            animate.alternate = (animate.iterationCount === -1 || animate.iterationCount > 1) && startsWith$1(direction, 'alternate');
                            groupName.push(animate);
                        }
                    }
                }
                groupOrdering.reverse();
                for (let i = 0, q = groupName.length; i < q; ++i) {
                    groupName[i].setGroupOrdering(groupOrdering);
                }
                return result;
            }
            getTitle(lang) {
                return getTextContent(this.element, 'title', lang);
            }
            getDesc(lang) {
                return !lang && getNamedItem$3(this.element, 'aria-describedby') || getTextContent(this.element, 'desc', lang);
            }
            set name(value) {
                this._name = value;
            }
            get name() {
                let result = this._name;
                if (result === null) {
                    const element = this.element;
                    let id = element.id.trim(), value, tagName;
                    if (id) {
                        id = convertWord(id);
                        if (!CACHE_VIEWNAME.has(id)) {
                            value = id;
                        }
                        tagName = id;
                    }
                    else {
                        tagName = element.tagName;
                    }
                    let index = CACHE_VIEWNAME.get(tagName) || 0;
                    if (value) {
                        CACHE_VIEWNAME.set(value, index);
                        result = value;
                    }
                    else {
                        CACHE_VIEWNAME.set(tagName, ++index);
                        result = tagName + '_' + index;
                    }
                    this._name = result;
                }
                return result;
            }
            get transforms() {
                return this._transforms || (this._transforms = this.getTransforms());
            }
            get animations() {
                return this._animations || (this._animations = this.getAnimations());
            }
            get visible() {
                const value = getAttribute(this.element, 'visibility');
                return value !== 'hidden' && value !== 'collapse' && getAttribute(this.element, 'display') !== 'none';
            }
            get opacity() {
                return getAttribute(this.element, 'opacity') || '1';
            }
        };
    };

    const { isUserAgent } = squared.lib.client;
    function hasUnsupportedAccess(element) {
        if (element.tagName === 'svg') {
            if (isUserAgent(4 /* FIREFOX */)) {
                return element.parentElement instanceof HTMLElement;
            }
            else if (isUserAgent(2 /* SAFARI */)) {
                return !(element.parentElement instanceof HTMLElement);
            }
        }
        return false;
    }
    var SvgViewRect$MX = (Base) => {
        return class extends Base {
            constructor() {
                super(...arguments);
                this._x = NaN;
                this._y = NaN;
                this._width = NaN;
                this._height = NaN;
            }
            setRect() {
                const parent = this.parent;
                let { x, y, width, height } = this;
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
            getRectElement() {
                const element = this.rectElement || this.element;
                switch (element.tagName) {
                    case 'svg':
                    case 'use':
                    case 'image':
                        return element;
                    default:
                        return null;
                }
            }
            set x(value) {
                this._x = value;
            }
            get x() {
                var _a;
                return isNaN(this._x) ? ((_a = this.getRectElement()) === null || _a === void 0 ? void 0 : _a.x.baseVal.value) || 0 : this._x;
            }
            set y(value) {
                this._y = value;
            }
            get y() {
                var _a;
                return isNaN(this._y) ? ((_a = this.getRectElement()) === null || _a === void 0 ? void 0 : _a.y.baseVal.value) || 0 : this._y;
            }
            set width(value) {
                this._width = value;
            }
            get width() {
                if (isNaN(this._width)) {
                    const element = this.getRectElement();
                    return element ? hasUnsupportedAccess(element) ? element.getBoundingClientRect().width : element.width.baseVal.value : 0;
                }
                return this._width;
            }
            set height(value) {
                this._height = value;
            }
            get height() {
                if (isNaN(this._height)) {
                    const element = this.getRectElement();
                    return element ? hasUnsupportedAccess(element) ? element.getBoundingClientRect().height : element.height.baseVal.value : 0;
                }
                return this._height;
            }
        };
    };

    const { cloneObject: cloneObject$2, iterateArray } = squared.lib.util;
    const REGEXP_LENGTHPERCENTAGE = new RegExp(squared.lib.regex.STRING.LENGTH_PERCENTAGE);
    function setAspectRatio(parent, group, viewBox, element) {
        if (parent) {
            const aspectRatio = group.aspectRatio;
            const parentAspectRatio = parent.aspectRatio;
            if (viewBox && element) {
                cloneObject$2(viewBox, { target: aspectRatio });
                const { width, height } = aspectRatio;
                if (width > 0 && height > 0) {
                    const ratio = width / height;
                    let parentWidth = parentAspectRatio.width || parent.viewBox.width, parentHeight = parentAspectRatio.height || parent.viewBox.height, boxWidth = NaN, boxHeight = NaN, unknownViewBox;
                    if (parentWidth === 0 && parentHeight === 0) {
                        ({ width: parentWidth, height: parentHeight } = getDOMRect(parent.element));
                        parentAspectRatio.width = parentWidth;
                        parentAspectRatio.height = parentHeight;
                        unknownViewBox = true;
                    }
                    const parentRatio = parentWidth / parentHeight;
                    const ratioWidth = parentWidth / width;
                    const ratioHeight = parentHeight / height;
                    const w = getAttribute(element, 'width');
                    const h = getAttribute(element, 'height');
                    if (unknownViewBox) {
                        boxWidth = parentWidth;
                        boxHeight = parentHeight;
                    }
                    else {
                        if (SVG.svg(element)) {
                            try {
                                boxWidth = element.width.baseVal.value;
                                boxHeight = element.height.baseVal.value;
                            }
                            catch (_a) {
                            }
                        }
                        if (!boxWidth && !boxHeight) {
                            boxWidth = +w;
                            boxHeight = +h;
                        }
                    }
                    const hasWidth = hasLength(w);
                    const hasHeight = hasLength(h);
                    const boxRatioWidth = boxWidth / width;
                    const boxRatioHeight = boxHeight / height;
                    let resizeUnit = hasWidth && hasHeight;
                    if (boxWidth >= width && boxHeight >= height) {
                        aspectRatio.unit = Math.min(boxRatioWidth, boxRatioHeight);
                        resizeUnit = false;
                    }
                    else if (ratioWidth !== ratioHeight || unknownViewBox) {
                        aspectRatio.unit = Math.min(ratioWidth, ratioHeight);
                    }
                    if (hasWidth || hasHeight) {
                        if (boxWidth && boxHeight) {
                            const { align, meetOrSlice } = element.preserveAspectRatio.baseVal;
                            if (boxRatioWidth === boxRatioHeight) {
                                if (resizeUnit) {
                                    aspectRatio.unit *= boxRatioWidth;
                                }
                                aspectRatio.align = SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMINYMIN;
                                if (width > height) {
                                    aspectRatio.alignX = true;
                                }
                                else {
                                    aspectRatio.alignY = true;
                                }
                            }
                            else {
                                switch (meetOrSlice) {
                                    case SVGPreserveAspectRatio.SVG_MEETORSLICE_MEET:
                                        if (boxRatioHeight < boxRatioWidth) {
                                            if (resizeUnit) {
                                                if (height >= width && height >= parentHeight) {
                                                    aspectRatio.unit = boxRatioHeight;
                                                }
                                                else {
                                                    aspectRatio.unit *= boxRatioHeight;
                                                }
                                            }
                                            aspectRatio.alignX = true;
                                        }
                                        else {
                                            if (resizeUnit) {
                                                if (width >= height && width >= parentWidth) {
                                                    aspectRatio.unit = boxRatioWidth;
                                                }
                                                else {
                                                    aspectRatio.unit *= boxRatioWidth;
                                                }
                                            }
                                            aspectRatio.alignY = true;
                                        }
                                        break;
                                    case SVGPreserveAspectRatio.SVG_MEETORSLICE_SLICE:
                                        if (boxRatioHeight > boxRatioWidth) {
                                            if (resizeUnit) {
                                                if (height >= width && height >= parentHeight) {
                                                    aspectRatio.unit = boxRatioHeight;
                                                }
                                                else {
                                                    aspectRatio.unit *= boxRatioHeight;
                                                }
                                            }
                                            aspectRatio.alignX = true;
                                            aspectRatio.alignY = height > parentHeight;
                                        }
                                        else {
                                            if (resizeUnit) {
                                                if (width >= height && width >= parentWidth) {
                                                    aspectRatio.unit = boxRatioWidth;
                                                }
                                                else {
                                                    aspectRatio.unit *= boxRatioWidth;
                                                }
                                            }
                                            aspectRatio.alignX = width > parentWidth;
                                            aspectRatio.alignY = true;
                                        }
                                        break;
                                }
                                aspectRatio.align = align;
                            }
                            aspectRatio.meetOrSlice = meetOrSlice;
                        }
                    }
                    else if (parentRatio > ratio) {
                        aspectRatio.position.x = (parentWidth - (parentHeight * ratio)) / 2;
                    }
                    else if (parentRatio < ratio) {
                        aspectRatio.position.y = (parentHeight - (parentWidth * (1 / ratio))) / 2;
                    }
                }
            }
            const { parent: parentOffset, position, unit, x, y } = parentAspectRatio;
            aspectRatio.parent.x = x + x * (unit - 1);
            aspectRatio.position.x *= parentAspectRatio.unit;
            aspectRatio.position.x += position.x - parentOffset.x;
            aspectRatio.parent.y = y + y * (unit - 1);
            aspectRatio.position.y *= unit;
            aspectRatio.position.y += position.y - parentOffset.y;
            aspectRatio.unit *= unit;
        }
    }
    function getViewport(container) {
        do {
            if (SvgBuild.asSvg(container) && container.documentRoot) {
                return container;
            }
            container = container.parent;
        } while (container);
        return null;
    }
    function getNearestViewBox(container) {
        do {
            if (container.hasViewBox()) {
                return container;
            }
            container = container.parent;
        } while (container);
    }
    const hasLength = (value) => REGEXP_LENGTHPERCENTAGE.test(value);
    class SvgContainer extends squared.lib.base.Container {
        constructor(element) {
            super();
            this.element = element;
            this.parent = null;
            this.viewport = null;
            this.instanceType = 2 /* SVG_CONTAINER */;
            this.aspectRatio = {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                position: { x: 0, y: 0 },
                parent: { x: 0, y: 0 },
                unit: 1,
                meetOrSlice: SVGPreserveAspectRatio.SVG_MEETORSLICE_UNKNOWN,
                align: SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMINYMIN,
                alignX: false,
                alignY: false
            };
            this._clipRegion = [];
        }
        add(item, viewport) {
            item.parent = this;
            item.viewport = viewport || getViewport(this);
            return super.add(item);
        }
        build(options) {
            let initialize = true, element, precision;
            if (options) {
                element = options.targetElement || this.element;
                precision = options.precision;
                options = Object.assign({}, options);
                if ('targetElement' in options) {
                    delete options.targetElement;
                }
                if (options.initialize === false) {
                    initialize = false;
                }
            }
            else {
                element = this.element;
            }
            const viewport = getViewport(this);
            let rootElement, contentMap = null;
            if (viewport) {
                ({ element: rootElement, contentMap } = viewport);
                if (precision === undefined) {
                    precision = viewport.precision;
                }
            }
            const parent = getNearestViewBox(this);
            const aspectRatio = this.aspectRatio;
            let requireClip;
            this.clear();
            iterateArray(element.children, (item) => {
                let svg;
                if (SVG.svg(item)) {
                    svg = new squared.svg.Svg(item, false);
                    setAspectRatio(parent, svg, item.viewBox.baseVal, item);
                    requireClip = true;
                }
                else if (SVG.g(item)) {
                    svg = new squared.svg.SvgG(item);
                    setAspectRatio(parent, svg);
                }
                else if (SVG.use(item)) {
                    const target = getTargetElement(item, rootElement, contentMap);
                    if (target) {
                        if (SVG.symbol(target)) {
                            svg = new squared.svg.SvgUseSymbol(target, item);
                            setAspectRatio(parent, svg, target.viewBox.baseVal, target);
                            requireClip = true;
                        }
                        else if (SVG.g(target)) {
                            svg = new squared.svg.SvgUseG(target, item);
                            setAspectRatio(parent, svg);
                        }
                        else if (SVG.image(target)) {
                            svg = new squared.svg.SvgImage(item, target);
                        }
                        else if (SVG.shape(target)) {
                            const pattern = viewport && viewport.findFill(item);
                            if (pattern) {
                                svg = new squared.svg.SvgUseShapePattern(target, item, pattern);
                                setAspectRatio(parent, svg);
                            }
                            else {
                                svg = new squared.svg.SvgUseShape(target, item, initialize);
                            }
                        }
                    }
                }
                else if (SVG.image(item)) {
                    svg = new squared.svg.SvgImage(item);
                }
                else if (SVG.shape(item)) {
                    const target = viewport && viewport.findFill(item);
                    if (target) {
                        svg = new squared.svg.SvgShapePattern(item, target);
                        setAspectRatio(parent, svg);
                    }
                    else {
                        svg = new squared.svg.SvgShape(item, initialize);
                    }
                }
                if (svg) {
                    this.add(svg, viewport);
                    svg.build(options);
                }
            });
            if (SvgBuild.asSvg(this) && (this.documentRoot || aspectRatio.meetOrSlice)) {
                if (this.documentRoot) {
                    if (aspectRatio.x < 0 || aspectRatio.y < 0) {
                        this.clipViewBox(aspectRatio.x, aspectRatio.y, aspectRatio.width, aspectRatio.height, precision, true);
                    }
                }
                else {
                    const { x, y } = this.parent.aspectRatio;
                    this.clipViewBox(x, y, this.width + x, this.height + y, precision, true);
                }
            }
            else if (requireClip && this.hasViewBox() && (aspectRatio.x !== 0 || aspectRatio.y !== 0)) {
                const { left, top } = SvgBuild.boxRectOf(this.getPathAll(false));
                const x = this.refitX(aspectRatio.x);
                const y = this.refitY(aspectRatio.y);
                if (left < x || top < y) {
                    this.clipViewBox(left, top, this.refitSize(aspectRatio.width), this.refitSize(aspectRatio.height), precision);
                }
            }
        }
        hasViewBox() {
            return SvgBuild.asSvg(this) && (!!this.element.viewBox.baseVal || this.documentRoot) || SvgBuild.asUseSymbol(this) && !!this.symbolElement.viewBox.baseVal;
        }
        clipViewBox(x, y, width, height, precision, documentRoot) {
            if (documentRoot) {
                width -= x;
                height -= y;
                if (SvgBuild.asSvg(this) && this.documentRoot) {
                    x = x < 0 ? x * -1 : 0;
                    y = y < 0 ? y * -1 : 0;
                }
                else {
                    x = x * -1;
                    y = y * -1;
                }
            }
            this.clipRegion = SvgBuild.drawRect(width, height, x, y, precision);
        }
        synchronize(options) {
            this.each(item => item.synchronize(options));
        }
        refitX(value) {
            const aspectRatio = this.aspectRatio;
            return (value - aspectRatio.x) * aspectRatio.unit - aspectRatio.parent.x + aspectRatio.position.x;
        }
        refitY(value) {
            const aspectRatio = this.aspectRatio;
            return (value - aspectRatio.y) * aspectRatio.unit - aspectRatio.parent.y + aspectRatio.position.y;
        }
        refitSize(value) {
            return value * this.aspectRatio.unit;
        }
        refitPoints(values) {
            const unit = this.aspectRatio.unit;
            const length = values.length;
            for (let i = 0; i < length; ++i) {
                const pt = values[i];
                pt.x = this.refitX(pt.x);
                pt.y = this.refitY(pt.y);
                if (pt.rx !== undefined && pt.ry !== undefined) {
                    pt.rx *= unit;
                    pt.ry *= unit;
                }
            }
            if (SvgBuild.asSvg(this) && this.aspectRatio.meetOrSlice) {
                const { align, alignX, alignY, parent } = this.aspectRatio;
                const { width, height } = this;
                const { top, right, bottom, left } = SvgBuild.minMaxOf(values, true);
                let x1 = 0, y1 = 0;
                if (alignX) {
                    x1 = parent.x * -1;
                }
                if (alignY) {
                    y1 = parent.y * -1;
                }
                let x = x1, y = y1;
                const xMid = () => (width / 2) - ((right + left) / 2);
                const xMax = () => (width - left) - right + x1;
                const yMid = () => (height / 2) - ((top + bottom) / 2);
                const yMax = () => (height - top) - bottom + y1;
                switch (align) {
                    case SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMINYMIN:
                        if (alignX) {
                            x -= x1;
                        }
                        if (alignY) {
                            y -= y1;
                        }
                        break;
                    case SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMINYMID:
                        if (alignX) {
                            x -= x1;
                        }
                        if (alignY) {
                            y += yMid();
                        }
                        break;
                    case SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMINYMAX:
                        if (alignX) {
                            x -= x1;
                        }
                        if (alignY) {
                            y += yMax();
                        }
                        break;
                    case SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMIDYMIN:
                        if (alignX) {
                            x += xMid();
                        }
                        if (alignY) {
                            y -= y1;
                        }
                        break;
                    case SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_NONE:
                    case SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMIDYMID:
                        if (alignX) {
                            x += xMid();
                        }
                        if (alignY) {
                            y += yMid();
                        }
                        break;
                    case SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMIDYMAX:
                        if (alignX) {
                            x += xMid();
                        }
                        if (alignY) {
                            y += yMax();
                        }
                        break;
                    case SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMAXYMIN:
                        if (alignX) {
                            x += xMax();
                        }
                        if (alignY) {
                            y -= y1;
                        }
                        break;
                    case SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMAXYMID:
                        if (alignX) {
                            x += xMax();
                        }
                        if (alignY) {
                            y += yMid();
                        }
                        break;
                    case SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMAXYMAX:
                        if (alignX) {
                            x += xMax();
                        }
                        if (alignY) {
                            y += yMax();
                        }
                        break;
                }
                for (let i = 0; i < length; ++i) {
                    const pt = values[i];
                    pt.x += x;
                    pt.y += y;
                }
            }
            return values;
        }
        getPathAll(cascade = true) {
            var _a;
            const result = [];
            for (const item of cascade ? this.cascade() : this.children) {
                if (SvgBuild.isShape(item)) {
                    const value = (_a = item.path) === null || _a === void 0 ? void 0 : _a.value;
                    if (value) {
                        result.push(value);
                    }
                }
            }
            return result;
        }
        set clipRegion(value) {
            if (value) {
                this._clipRegion.push(value);
            }
            else {
                this._clipRegion = [];
            }
        }
        get clipRegion() {
            return this._clipRegion.join(';');
        }
        get requireRefit() {
            const aspectRatio = this.aspectRatio;
            return aspectRatio.x !== 0 || aspectRatio.y !== 0 || aspectRatio.unit !== 1 || aspectRatio.position.x !== 0 || aspectRatio.position.y !== 0 || aspectRatio.parent.x !== 0 || aspectRatio.parent.y !== 0;
        }
    }

    const { parseColor: parseColor$1 } = squared.lib.color;
    const { extractURL: extractURL$1, getKeyframesRules } = squared.lib.css;
    const { getNamedItem: getNamedItem$2 } = squared.lib.dom;
    const { cloneObject: cloneObject$1 } = squared.lib.util;
    function getColorStop(element) {
        const result = [];
        const stops = element.getElementsByTagName('stop');
        for (let i = 0, length = stops.length; i < length; ++i) {
            const item = stops[i];
            const color = parseColor$1(getNamedItem$2(item, 'stop-color'), +(getNamedItem$2(item, 'stop-opacity') || '1'));
            if (color) {
                result.push({ color, offset: parseFloat(getNamedItem$2(item, 'offset')) / 100 });
            }
        }
        return result;
    }
    function getBaseValue(element, ...attrs) {
        const result = {};
        for (let i = 0, length = attrs.length; i < length; ++i) {
            const attr = attrs[i];
            const item = element[attr];
            if (item) {
                result[attr] = item.baseVal.value;
                result[attr + 'AsString'] = item.baseVal.valueAsString;
            }
        }
        return result;
    }
    function createLinearGradient(element) {
        return Object.assign({ type: 'linear', element, spreadMethod: element.spreadMethod.baseVal, colorStops: getColorStop(element), dimension: null }, getBaseValue(element, 'x1', 'x2', 'y1', 'y2'));
    }
    function createRadialGradient(element) {
        return Object.assign({ type: 'radial', element, spreadMethod: element.spreadMethod.baseVal, colorStops: getColorStop(element), dimension: null }, getBaseValue(element, 'cx', 'cy', 'r', 'fx', 'fy', 'fr'));
    }
    class Svg extends SvgSynchronize$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgView$MX(SvgContainer)))) {
        constructor(element, documentRoot = true) {
            super(element);
            this.element = element;
            this.documentRoot = documentRoot;
            this.instanceType = 18 /* SVG */;
            this.definitions = {
                clipPath: new Map(),
                pattern: new Map(),
                gradient: new Map(),
                contentMap: null
            };
            if (documentRoot) {
                this.viewport = this;
            }
            this.init();
        }
        build(options) {
            if (this.documentRoot) {
                this.keyframesMap = options.keyframesMap || getKeyframesRules();
            }
            this.precision = options.precision;
            this.setRect();
            super.build(options);
        }
        synchronize(options) {
            if (!this.documentRoot && this.animations.length) {
                this.animateSequentially(this.getAnimateViewRect(), this.getAnimateTransform(options), undefined, options);
            }
            super.synchronize(options);
        }
        findFill(value) {
            if (typeof value !== 'string') {
                value = extractURL$1(getParentAttribute(value, 'fill')) || '';
            }
            if (value) {
                const result = this.definitions.pattern.get(value);
                if (result) {
                    return result;
                }
                const element = document.getElementById(value.substring(1));
                if (element instanceof SVGPatternElement) {
                    return element;
                }
            }
        }
        findFillPattern(value) {
            if (typeof value !== 'string') {
                value = extractURL$1(getParentAttribute(value, 'fillPattern')) || '';
            }
            let result;
            if (value) {
                result = this.definitions.gradient.get(value);
                if (!result) {
                    const element = document.getElementById(value.substring(1));
                    if (element) {
                        if (SVG.linearGradient(element)) {
                            result = createLinearGradient(element);
                        }
                        else if (SVG.radialGradient(element)) {
                            result = createRadialGradient(element);
                        }
                        if (result) {
                            this.definitions.gradient.set(value, result);
                        }
                    }
                }
            }
            return result;
        }
        init() {
            const element = this.element;
            if (this.documentRoot) {
                cloneObject$1(element.viewBox.baseVal, { target: this.aspectRatio });
                element.querySelectorAll('set, animate, animateTransform, animateMotion').forEach((animation) => {
                    const target = getTargetElement(animation, element);
                    if (target) {
                        const parentElement = animation.parentElement;
                        if (parentElement) {
                            parentElement.removeChild(animation);
                        }
                        target.appendChild(animation);
                    }
                });
            }
            this.setDefinitions(element);
            element.querySelectorAll('defs').forEach(def => this.setDefinitions(def));
        }
        setDefinitions(item) {
            const definitions = this.definitions;
            item.querySelectorAll('clipPath, pattern, linearGradient, radialGradient').forEach((element) => {
                const id = `#${element.id.trim()}`;
                if (id !== '#') {
                    if (SVG.clipPath(element)) {
                        if (!definitions.clipPath.has(id)) {
                            definitions.clipPath.set(id, element);
                        }
                    }
                    else if (SVG.pattern(element)) {
                        if (!definitions.pattern.has(id)) {
                            definitions.pattern.set(id, element);
                        }
                    }
                    else if (SVG.linearGradient(element)) {
                        if (!definitions.gradient.has(id)) {
                            definitions.gradient.set(id, createLinearGradient(element));
                        }
                    }
                    else if (SVG.radialGradient(element)) {
                        if (!definitions.gradient.has(id)) {
                            definitions.gradient.set(id, createRadialGradient(element));
                        }
                    }
                }
            });
        }
        set contentMap(value) {
            this.definitions.contentMap = value;
        }
        get contentMap() {
            return this.definitions.contentMap;
        }
        get viewBox() {
            return this.element.viewBox.baseVal || { x: 0, y: 0, width: 0, height: 0 };
        }
    }

    class SvgElement {
        constructor(element) {
            this.element = element;
            this.parent = null;
            this.viewport = null;
            this.instanceType = 4 /* SVG_ELEMENT */;
        }
        build(options) { }
        synchronize(options) { }
    }

    const { STRING } = squared.lib.regex;
    const { parseColor } = squared.lib.color;
    const { extractURL, getFontSize, hasCalc, hasEm, isCustomProperty, isLength, isPercent, parseUnit, parseVar } = squared.lib.css;
    const { truncate } = squared.lib.math;
    const { convertCamelCase, convertPercent: convertPercent$1, isNumber, joinArray, plainMap } = squared.lib.util;
    const REGEXP_CACHE = {
        polygon: /polygon\(([^)]+)\)/,
        inset: new RegExp(`inset\\(${STRING.LENGTH_PERCENTAGE}\\s?${STRING.LENGTH_PERCENTAGE}?\\s?${STRING.LENGTH_PERCENTAGE}?\\s?${STRING.LENGTH_PERCENTAGE}?\\)`),
        circle: new RegExp(`circle\\(${STRING.LENGTH_PERCENTAGE}(?:\\s+at\\s+${STRING.LENGTH_PERCENTAGE}\\s+${STRING.LENGTH_PERCENTAGE})?\\)`),
        ellipse: new RegExp(`ellipse\\(${STRING.LENGTH_PERCENTAGE}\\s+${STRING.LENGTH_PERCENTAGE}(?:\\s+at\\s+${STRING.LENGTH_PERCENTAGE}\\s+${STRING.LENGTH_PERCENTAGE})?\\)`)
    };
    var SvgPaint$MX = (Base) => {
        return class extends Base {
            constructor() {
                super(...arguments);
                this.fill = '';
                this.fillPattern = '';
                this.fillOpacity = '';
                this.fillRule = '';
                this.stroke = '';
                this.strokePattern = '';
                this.strokeOpacity = '';
                this.strokeLinecap = '';
                this.strokeLinejoin = '';
                this.strokeMiterlimit = '';
                this.strokeDasharray = '';
                this.strokeDashoffset = '';
                this.color = '';
                this.clipPath = '';
                this.clipRule = '';
                this._strokeWidth = '';
            }
            setStroke() {
                this.setAttribute('stroke');
                this.setAttribute('stroke-width');
            }
            setPaint(d, precision) {
                this.resetPaint();
                this.setAttribute('color');
                this.setAttribute('fill');
                this.setAttribute('fill-opacity');
                this.setAttribute('fill-rule');
                this.setStroke();
                this.setAttribute('stroke-opacity');
                this.setAttribute('stroke-linecap');
                this.setAttribute('stroke-linejoin');
                this.setAttribute('stroke-miterlimit');
                this.setAttribute('stroke-dasharray');
                this.setAttribute('stroke-dashoffset');
                this.setAttribute('clip-rule');
                const clipPath = this.getAttribute('clip-path');
                if (clipPath && clipPath !== 'none') {
                    const url = extractURL(clipPath);
                    if (url) {
                        this.clipPath = url;
                    }
                    else if (d && d.length) {
                        for (const name in REGEXP_CACHE) {
                            const match = REGEXP_CACHE[name].exec(clipPath);
                            if (match) {
                                const { top, right, bottom, left } = SvgBuild.boxRectOf(d);
                                const width = right - left;
                                const height = bottom - top;
                                const parent = this.parent;
                                switch (name) {
                                    case 'inset': {
                                        let x1 = 0, y1 = this.convertLength(match[1], height), x2 = 0, y2 = 0;
                                        if (match[4]) {
                                            x1 = left + this.convertLength(match[4], width);
                                            x2 = right - this.convertLength(match[2], width);
                                            y2 = bottom - this.convertLength(match[3], height);
                                        }
                                        else if (match[2]) {
                                            x1 = this.convertLength(match[2], width);
                                            x2 = right - x1;
                                            y2 = bottom - (match[3] ? this.convertLength(match[3], height) : y1);
                                            x1 += left;
                                        }
                                        else {
                                            x1 = left + y1;
                                            x2 = right - y1;
                                            y2 = bottom - y1;
                                        }
                                        y1 += top;
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
                                        break;
                                    }
                                    case 'polygon': {
                                        const points = plainMap(match[1].split(','), values => {
                                            let x = left, y = top;
                                            values.trim().split(' ').forEach((value, index) => {
                                                if (index === 0) {
                                                    x += this.convertLength(value, width);
                                                }
                                                else {
                                                    y += this.convertLength(value, height);
                                                }
                                            });
                                            return { x, y };
                                        });
                                        if (parent) {
                                            parent.refitPoints(points);
                                        }
                                        this.clipPath = SvgBuild.drawPolygon(points, precision);
                                        break;
                                    }
                                    default:
                                        if (name === 'circle' || name === 'ellipse') {
                                            const dimension = width < height ? width : height;
                                            let rx, ry;
                                            if (name === 'circle') {
                                                rx = this.convertLength(match[1], dimension);
                                                ry = rx;
                                            }
                                            else {
                                                rx = this.convertLength(match[1], width);
                                                ry = this.convertLength(match[2], height);
                                            }
                                            let cx = left, cy = top;
                                            const length = match.length;
                                            if (length >= 4) {
                                                cx += this.convertLength(match[length - 2], dimension);
                                                cy += this.convertLength(match[length - 1], dimension);
                                            }
                                            if (parent) {
                                                cx = parent.refitX(cx);
                                                cy = parent.refitX(cy);
                                                rx = parent.refitSize(rx);
                                                ry = parent.refitSize(ry);
                                            }
                                            this.clipPath = SvgBuild.drawEllipse(cx, cy, rx, ry, precision);
                                        }
                                        break;
                                }
                                break;
                            }
                        }
                    }
                }
            }
            setAttribute(attr) {
                const element = this.element;
                let value = this.getAttribute(attr);
                if (value) {
                    attr = convertCamelCase(attr);
                    if (hasCalc(value)) {
                        value = calculateStyle(element, attr, value) || getComputedStyle(element)[attr];
                    }
                    else if (isCustomProperty(value)) {
                        value = parseVar(element, value) || getComputedStyle(element)[attr];
                    }
                    switch (attr) {
                        case 'strokeDasharray':
                            value = value !== 'none' ? joinArray(value.replace(/[,\s]+/g, ',').split(','), unit => this.convertLength(unit).toString(), ', ') : '';
                            break;
                        case 'strokeDashoffset':
                        case 'strokeWidth':
                            value = this.convertLength(value).toString();
                            break;
                        case 'fill':
                        case 'stroke': {
                            const url = extractURL(value);
                            if (url) {
                                this[attr + 'Pattern'] = url;
                            }
                            else {
                                let color;
                                switch (value) {
                                    case 'none':
                                    case 'transparent':
                                    case 'rgba(0, 0, 0, 0)':
                                        this[attr] = 'none';
                                        return;
                                    case 'currentcolor':
                                    case 'currentColor':
                                        value = this.color || getAttribute(element, 'color', true);
                                    default:
                                        color = parseColor(value);
                                        break;
                                }
                                if (color) {
                                    this[attr] = color.value;
                                }
                            }
                            return;
                        }
                    }
                    this[attr] = value;
                }
            }
            getAttribute(attr) {
                let value = getAttribute(this.element, attr);
                if (!value) {
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
                        if (value = getAttribute(SvgBuild.isUse(current) ? current.useElement : current.element, attr)) {
                            break;
                        }
                        current = current.parent;
                    }
                }
                return value;
            }
            convertLength(value, dimension) {
                if (isNumber(value)) {
                    return +value;
                }
                else if (isLength(value)) {
                    return parseUnit(value, hasEm(value) ? { fontSize: getFontSize(this.element) } : undefined);
                }
                else if (isPercent(value)) {
                    return Math.round((typeof dimension === 'number' ? dimension : this.element.getBoundingClientRect()[dimension || 'width']) * convertPercent$1(value));
                }
                return 0;
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
            set strokeWidth(value) {
                this._strokeWidth = value;
            }
            get strokeWidth() {
                var _a;
                const stroke = this.stroke;
                if (stroke && stroke !== 'none') {
                    const result = this._strokeWidth;
                    if (result) {
                        return ((_a = this.parent) === null || _a === void 0 ? void 0 : _a.requireRefit) ? truncate(this.parent.refitSize(+result)) : result;
                    }
                }
                return '';
            }
        };
    };

    class SvgG extends SvgPaint$MX(SvgView$MX(SvgContainer)) {
        constructor(element) {
            super(element);
            this.element = element;
            this.instanceType = 34 /* SVG_G */;
        }
        build(options) {
            super.build(options);
            this.setPaint(this.getPathAll(), options && options.precision);
        }
    }

    const { resolvePath } = squared.lib.util;
    class SvgImage extends SvgViewRect$MX(SvgBaseVal$MX(SvgView$MX(SvgElement))) {
        constructor(element, imageElement) {
            super(element);
            this.element = element;
            this.imageElement = null;
            this.instanceType = 8196 /* SVG_IMAGE */;
            if (imageElement) {
                this.imageElement = imageElement;
                this.rectElement = imageElement;
            }
        }
        build() {
            this.setRect();
        }
        renderStatic(exclude) {
            let { x, y, width, height, parent: container } = this;
            const transforms = exclude ? SvgBuild.filterTransforms(this.transforms, exclude) : this.transforms;
            const length = transforms.length;
            if (length) {
                transforms.reverse();
                for (let i = 0; i < length; ++i) {
                    const item = transforms[i];
                    const m = item.matrix;
                    const localX = x;
                    x = MATRIX.applyX(m, localX, y);
                    y = MATRIX.applyY(m, localX, y);
                    let angle = this.rotateAngle;
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
                                if (angle) {
                                    angle += item.angle;
                                }
                                else {
                                    angle = item.angle;
                                }
                            }
                            break;
                    }
                    this.rotateAngle = angle;
                }
                this.transformed = transforms;
            }
            if (container) {
                if (this.imageElement) {
                    const element = this.element;
                    x += element.x.baseVal.value;
                    y += element.y.baseVal.value;
                }
                x = container.refitX(x);
                y = container.refitY(y);
                width = container.refitSize(width);
                height = container.refitSize(height);
                do {
                    if (SvgBuild.asSvg(container) || SvgBuild.isUse(container)) {
                        const { x: offsetX, y: offsetY } = container;
                        if (container = container.parent) {
                            if (offsetX !== 0) {
                                x += container.refitX(offsetX);
                            }
                            if (offsetY !== 0) {
                                y += container.refitY(offsetY);
                            }
                        }
                    }
                    else {
                        container = container.parent;
                    }
                } while (container);
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
            var _a;
            return super.x || ((_a = this.imageElement) === null || _a === void 0 ? void 0 : _a.x.baseVal.value) || 0;
        }
        set y(value) {
            super.y = value;
        }
        get y() {
            var _a;
            return super.y || ((_a = this.imageElement) === null || _a === void 0 ? void 0 : _a.y.baseVal.value) || 0;
        }
        set width(value) {
            super.width = value;
        }
        get width() {
            var _a;
            return super.width || ((_a = this.imageElement) === null || _a === void 0 ? void 0 : _a.width.baseVal.value) || 0;
        }
        set height(value) {
            super.height = value;
        }
        get height() {
            var _a;
            return super.height || ((_a = this.imageElement) === null || _a === void 0 ? void 0 : _a.height.baseVal.value) || 0;
        }
        get href() {
            const element = this.imageElement || this.element;
            return SVG.image(element) ? resolvePath(element.href.baseVal) : '';
        }
        get transforms() {
            return !this._transforms ? this._transforms = this.imageElement ? super.transforms.concat(this.getTransforms(this.imageElement)) : super.transforms : this._transforms;
        }
        get animations() {
            return !this._animations ? this._animations = this.imageElement ? super.animations.concat(this.getAnimations(this.imageElement)) : super.animations : this._animations;
        }
    }

    const { getNamedItem: getNamedItem$1 } = squared.lib.dom;
    const { equal, lessEqual, multipleOf, offsetAngleX, offsetAngleY, relativeAngle, truncateFraction } = squared.lib.math;
    const { cloneObject, convertInt, convertFloat, startsWith } = squared.lib.util;
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
        for (let i = 0, length = path.length; i < length; ++i) {
            const seg = path[i];
            const { coordinates, value } = seg;
            for (let j = 0, k = 0, q = coordinates.length; j < q; j += 2, ++k) {
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
        for (let i = 0, length = path.length; i < length; ++i) {
            const seg = path[i];
            if (seg.key.toUpperCase() === 'A') {
                if (rx !== undefined) {
                    const offset = rx - seg.radiusX;
                    const x = rx * 2 * (seg.coordinates[0] < 0 ? -1 : 1);
                    seg.radiusX = rx;
                    seg.coordinates[0] = x;
                    seg.start.x = x;
                    seg.end.x = x;
                    if (i === 1) {
                        const first = path[0];
                        first.coordinates[0] -= offset;
                        first.start.x -= offset;
                        first.end.x -= offset;
                    }
                }
                if (ry !== undefined) {
                    seg.radiusY = ry;
                }
            }
        }
    }
    function getDashOffset(map, valueOffset, time, playing) {
        const value = map.get('stroke-dashoffset', time, playing);
        return value ? +value : valueOffset;
    }
    function getDashArray(map, valueArray, time, playing) {
        const value = map.get('stroke-dasharray', time, playing);
        return value ? SvgBuild.parseCoordinates(value) : valueArray;
    }
    const getFromToValue = (item) => item ? item.start + ' ' + item.end : '1 1';
    class SvgPath extends SvgPaint$MX(SvgBaseVal$MX(SvgElement)) {
        constructor(element) {
            super(element);
            this.element = element;
            this.name = '';
            this.value = '';
            this.baseValue = '';
            this.parent = null;
            this.transformed = null;
            this.instanceType = 16388 /* SVG_PATH */;
            this.init();
        }
        static extrapolate(attr, pathData, values, transforms, parent, precision) {
            const container = parent && parent.parent;
            const transformRefit = transforms && transforms.length > 0 || container && container.requireRefit;
            const result = [];
            let commands;
            for (let i = 0, length = values.length; i < length; ++i) {
                if (attr === 'd') {
                    result[i] = values[i];
                }
                else if (attr === 'points') {
                    const points = SvgBuild.convertPoints(SvgBuild.parseCoordinates(values[i]));
                    if (points.length) {
                        result[i] = parent && SVG.polygon(parent.element) ? SvgBuild.drawPolygon(points, precision) : SvgBuild.drawPolyline(points, precision);
                    }
                }
                else if (pathData) {
                    commands || (commands = SvgBuild.toPathCommands(pathData));
                    const value = +values[i];
                    if (!isNaN(value)) {
                        const path = i < length - 1 ? cloneObject(commands, { deep: true }) : commands;
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
                        result[i] = SvgBuild.transformRefit(result[i], { transforms, parent, container, precision });
                    }
                }
                else {
                    result[i] = '';
                }
            }
            return result;
        }
        build(options) {
            var _a;
            this.draw(options && options.transforms ? SvgBuild.filterTransforms(options.transforms, (_a = options.exclude) === null || _a === void 0 ? void 0 : _a[this.element.tagName]) : null, options);
        }
        draw(transforms, options) {
            let residualHandler, precision;
            if (options) {
                ({ residualHandler, precision } = options);
            }
            const element = this.element;
            const parent = this.parent;
            const patternParent = this.patternParent;
            const requireRefit = parent && parent.requireRefit;
            const patternRefit = patternParent && patternParent.patternContentUnits === 2 /* OBJECT_BOUNDING_BOX */;
            this.transformed = null;
            let d;
            if (SVG.path(element)) {
                d = sanitizePath(this.getBaseValue('d'));
                if (transforms && transforms.length || requireRefit || patternRefit) {
                    const commands = SvgBuild.toPathCommands(d);
                    if (commands.length) {
                        let points = SvgBuild.toPathPoints(commands);
                        if (points.length) {
                            if (patternRefit) {
                                patternParent.patternRefitPoints(points);
                            }
                            if (transforms && transforms.length) {
                                if (typeof residualHandler === 'function') {
                                    [this.transformResidual, transforms] = residualHandler.call(this, element, transforms);
                                }
                                if (transforms.length) {
                                    points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                                    this.transformed = transforms;
                                }
                            }
                            this.baseValue = SvgBuild.drawPath(SvgBuild.syncPath(requireRefit ? cloneObject(commands, { deep: true }) : commands, requireRefit ? cloneObject(points, { deep: true }) : points, !!this.transformed), precision);
                            if (requireRefit) {
                                parent.refitPoints(points);
                                d = SvgBuild.drawPath(SvgBuild.syncPath(commands, points, !!this.transformed), precision);
                            }
                            else {
                                d = this.baseValue;
                            }
                        }
                    }
                }
                this.baseValue || (this.baseValue = d);
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
                    if (typeof residualHandler === 'function') {
                        [this.transformResidual, transforms] = residualHandler.call(this, element, transforms);
                    }
                    if (transforms.length) {
                        points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                        this.transformed = transforms;
                    }
                }
                const drawPolyline = () => SvgBuild.drawPolyline(points, precision);
                this.baseValue = drawPolyline();
                if (requireRefit) {
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
                let rx, ry;
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
                    if (typeof residualHandler === 'function') {
                        [this.transformResidual, transforms] = residualHandler.call(this, element, transforms, rx, ry);
                    }
                    if (transforms.length) {
                        points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                        this.transformed = transforms;
                    }
                }
                const pt = points[0];
                const drawEllipse = () => SvgBuild.drawEllipse(pt.x, pt.y, pt.rx, pt.ry, precision);
                this.baseValue = drawEllipse();
                if (requireRefit) {
                    parent.refitPoints(points);
                    d = drawEllipse();
                }
                else {
                    d = this.baseValue;
                }
            }
            else if (SVG.rect(element)) {
                let x = this.getBaseValue('x'), y = this.getBaseValue('y'), width = this.getBaseValue('width'), height = this.getBaseValue('height');
                if (requireRefit || transforms && transforms.length) {
                    let points = [
                        { x, y },
                        { x: x + width, y },
                        { x: x + width, y: y + height },
                        { x, y: y + height }
                    ];
                    if (patternRefit) {
                        patternParent.patternRefitPoints(points);
                    }
                    if (transforms && transforms.length) {
                        if (typeof residualHandler === 'function') {
                            [this.transformResidual, transforms] = residualHandler.call(this, element, transforms);
                        }
                        if (transforms.length) {
                            points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                            this.transformed = transforms;
                        }
                    }
                    this.baseValue = SvgBuild.drawPolygon(points, precision);
                    if (requireRefit) {
                        parent.refitPoints(points);
                        d = SvgBuild.drawPolygon(points, precision);
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
                    d = SvgBuild.drawRect(width, height, x, y, precision);
                    this.baseValue = d;
                }
            }
            else if (SVG.polygon(element) || SVG.polyline(element)) {
                let points = this.getBaseValue('points');
                if (patternRefit) {
                    patternParent.patternRefitPoints(points);
                }
                if (transforms && transforms.length) {
                    if (typeof residualHandler === 'function') {
                        [this.transformResidual, transforms] = residualHandler.call(this, element, transforms);
                    }
                    if (transforms.length) {
                        points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                        this.transformed = transforms;
                    }
                }
                const drawPolygon = () => SVG.polygon(element) ? SvgBuild.drawPolygon(points, precision) : SvgBuild.drawPolyline(points, precision);
                this.baseValue = drawPolygon();
                if (requireRefit) {
                    if (!this.transformed) {
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
            switch (element.tagName) {
                case 'line':
                case 'polyline':
                    this.fill = '';
                    break;
            }
            return d;
        }
        extendLength(data, precision) {
            if (this.value) {
                switch (this.element.tagName) {
                    case 'path':
                    case 'line':
                    case 'polyline': {
                        const commands = SvgBuild.toPathCommands(this.value);
                        const length = commands.length;
                        if (length) {
                            const pathStart = commands[0];
                            const pathStartPoint = pathStart.start;
                            const pathEnd = commands[length - 1];
                            const pathEndPoint = pathEnd.end;
                            const name = pathEnd.key.toUpperCase();
                            const { leading, trailing } = data;
                            let modified;
                            if (name !== 'Z' && (pathStartPoint.x !== pathEndPoint.x || pathStartPoint.y !== pathEndPoint.y)) {
                                if (leading > 0) {
                                    let afterStartPoint;
                                    if (pathStart.value.length > 1) {
                                        afterStartPoint = pathStart.value[1];
                                    }
                                    else if (length > 1) {
                                        afterStartPoint = commands[1].start;
                                    }
                                    if (afterStartPoint) {
                                        const coordinates = pathStart.coordinates;
                                        if (afterStartPoint.x === pathStartPoint.x) {
                                            coordinates[1] += pathStartPoint.y > afterStartPoint.y ? leading : leading * -1;
                                            modified = true;
                                        }
                                        else if (afterStartPoint.y === pathStartPoint.y) {
                                            coordinates[0] += pathStartPoint.x > afterStartPoint.x ? leading : leading * -1;
                                            modified = true;
                                        }
                                        else {
                                            const angle = relativeAngle(afterStartPoint, pathStartPoint);
                                            coordinates[0] -= offsetAngleX(angle, leading);
                                            coordinates[1] -= offsetAngleY(angle, leading);
                                            modified = true;
                                        }
                                    }
                                }
                                switch (name) {
                                    case 'M':
                                    case 'L':
                                        if (trailing > 0) {
                                            let beforeEndPoint;
                                            if (length === 1) {
                                                const startValue = pathStart.value;
                                                if (startValue.length > 1) {
                                                    beforeEndPoint = startValue[startValue.length - 2];
                                                }
                                            }
                                            else {
                                                const endValue = pathEnd.value;
                                                if (endValue.length > 1) {
                                                    beforeEndPoint = endValue[endValue.length - 2];
                                                }
                                                else {
                                                    beforeEndPoint = commands[commands.length - 2].end;
                                                }
                                            }
                                            if (beforeEndPoint) {
                                                const coordinates = pathEnd.coordinates;
                                                if (beforeEndPoint.x === pathEndPoint.x) {
                                                    coordinates[1] += pathEndPoint.y > beforeEndPoint.y ? trailing : trailing * -1;
                                                    modified = true;
                                                }
                                                else if (beforeEndPoint.y === pathEndPoint.y) {
                                                    coordinates[0] += pathEndPoint.x > beforeEndPoint.x ? trailing : trailing * -1;
                                                    modified = true;
                                                }
                                                else {
                                                    const angle = relativeAngle(beforeEndPoint, pathEndPoint);
                                                    coordinates[0] += offsetAngleX(angle, trailing);
                                                    coordinates[1] += offsetAngleY(angle, trailing);
                                                    modified = true;
                                                }
                                            }
                                        }
                                        break;
                                    case 'H':
                                    case 'V': {
                                        const coordinates = pathEnd.coordinates;
                                        const index = name === 'H' ? 0 : 1;
                                        coordinates[index] += (leading + trailing) * (coordinates[index] >= 0 ? 1 : -1);
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
                            break;
                        }
                    }
                }
            }
            return data;
        }
        flattenStrokeDash(valueArray, valueOffset, totalLength, pathLength, data) {
            pathLength || (pathLength = totalLength);
            let dashTotal = 0, dashArray, arrayLength, dashArrayTotal, extendedLength, end, j = 0;
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
                const dashLength = multipleOf([2, arrayLength]);
                dashArrayTotal = 0;
                for (let i = 0; i < dashLength; ++i) {
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
            for (let i = 0, length = 0;; i += length, ++j) {
                length = getDash(j);
                let startOffset, actualLength;
                if (i < valueOffset) {
                    data.leading = valueOffset - i;
                    startOffset = 0;
                    actualLength = length - data.leading;
                }
                else {
                    startOffset = i - valueOffset;
                    actualLength = length;
                }
                const start = truncateFraction(startOffset / extendedLength);
                end = truncateFraction(start + (actualLength / extendedLength));
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
            data.trailing = truncateFraction((end - 1) * extendedLength);
            while (dashTotal % dashArrayTotal !== 0) {
                const value = getDash(++j);
                data.trailing += value;
                dashTotal += value;
            }
            if (data.items.length === 0) {
                data.items.push({ start: 1, end: 1 });
            }
            else {
                data.leadingOffset = truncateFraction(data.items[0].start * extendedLength);
                data.leading *= data.lengthRatio;
                data.trailing *= data.lengthRatio;
            }
            return data;
        }
        extractStrokeDash(animations, precision) {
            const strokeWidth = +this.strokeWidth;
            let path = '', clipPath = '', result;
            if (strokeWidth) {
                let valueArray = SvgBuild.parseCoordinates(this.strokeDasharray);
                if (valueArray.length) {
                    const totalLength = this.totalLength;
                    const pathLength = this.pathLength || totalLength;
                    const dashGroup = [];
                    let valueOffset = convertInt(this.strokeDashoffset), dashTotal = 0, flattenData;
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
                            if (startsWith(a.attributeName, 'stroke-dash') && startsWith(b.attributeName, 'stroke-dash')) {
                                if (a.delay !== b.delay) {
                                    return a.delay - b.delay;
                                }
                                else if (SvgBuild.asSet(a) && SvgBuild.asAnimate(b) || !a.animationElement && b.animationElement) {
                                    return -1;
                                }
                                else if (SvgBuild.asAnimate(a) && SvgBuild.asSet(b) || a.animationElement && !b.animationElement) {
                                    return 1;
                                }
                            }
                            return 0;
                        });
                        const intervalMap = new SvgAnimationIntervalMap(sorted, 'stroke-dasharray', 'stroke-dashoffset');
                        const setDashLength = (index) => {
                            let offset = valueOffset;
                            for (let j = index, length = sorted.length; j < length; ++j) {
                                const item = sorted[j];
                                if (item.attributeName === 'stroke-dasharray') {
                                    const value = intervalMap.get('stroke-dashoffset', item.delay);
                                    if (value) {
                                        offset = +value;
                                    }
                                    for (const array of SvgBuild.asAnimate(item) ? intervalMap.evaluateStart(item) : [item.to]) {
                                        dashTotal = Math.max(dashTotal, this.flattenStrokeDash(SvgBuild.parseCoordinates(array), offset, totalLength, pathLength).items.length);
                                    }
                                }
                            }
                        };
                        const extracted = [];
                        let initialized, modified;
                        if (sorted.length > 1) {
                            for (let i = 0; i < sorted.length; ++i) {
                                const item = sorted[i];
                                if (!intervalMap.has(item.attributeName, item.delay, item)) {
                                    sorted.splice(i--, 1);
                                }
                            }
                        }
                        for (let i = 0; i < sorted.length; ++i) {
                            const item = sorted[i];
                            if (item.setterType) {
                                const setDashGroup = (values, offset) => {
                                    createDashGroup(values, offset, item.delay, item.fillReplace && item.duration > 0 ? item.duration : 0);
                                    modified = true;
                                };
                                switch (item.attributeName) {
                                    case 'stroke-dasharray':
                                        valueArray = SvgBuild.parseCoordinates(item.to);
                                        setDashGroup(valueArray, getDashOffset(intervalMap, valueOffset, item.delay));
                                        continue;
                                    case 'stroke-dashoffset':
                                        valueOffset = convertInt(item.to);
                                        setDashGroup(getDashArray(intervalMap, valueArray, item.delay), valueOffset);
                                        continue;
                                }
                            }
                            else if (SvgBuild.asAnimate(item) && item.playable) {
                                intervalMap.evaluateStart(item);
                                switch (item.attributeName) {
                                    case 'stroke-dasharray': {
                                        if (!initialized) {
                                            setDashLength(i);
                                            initialized = true;
                                        }
                                        const delayOffset = getDashOffset(intervalMap, valueOffset, item.delay);
                                        const baseValue = this.flattenStrokeDash(getDashArray(intervalMap, valueArray, item.delay), delayOffset, totalLength, pathLength).items;
                                        const group = [];
                                        const values = [];
                                        for (let j = 0; j < dashTotal; ++j) {
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
                                        const items = item.values;
                                        for (let j = 0, q = items.length; j < q; ++j) {
                                            const dashValue = this.flattenStrokeDash(SvgBuild.parseCoordinates(items[j]), delayOffset, totalLength, pathLength).items;
                                            for (let k = 0; k < dashTotal; ++k) {
                                                values[k].push(getFromToValue(dashValue[k]));
                                            }
                                        }
                                        const { keyTimes, keySplines } = item;
                                        const timingFunction = item.timingFunction;
                                        for (let j = 0; j < dashTotal; ++j) {
                                            const data = group[j];
                                            data.values = values[j];
                                            data.keyTimes = keyTimes;
                                            if (keySplines) {
                                                data.keySplines = keySplines;
                                            }
                                            else if (timingFunction) {
                                                data.timingFunction = timingFunction;
                                            }
                                        }
                                        if (item.fillReplace) {
                                            const totalDuration = item.getTotalDuration();
                                            const replaceValue = this.flattenStrokeDash(getDashArray(intervalMap, valueArray, totalDuration), getDashOffset(intervalMap, valueOffset, totalDuration), totalLength, pathLength).items;
                                            for (let j = 0; j < dashTotal; ++j) {
                                                group[j].replaceValue = getFromToValue(replaceValue[j]);
                                            }
                                        }
                                        extracted.push(...group);
                                        modified = true;
                                        continue;
                                    }
                                    case 'stroke-dashoffset': {
                                        const duration = item.duration;
                                        const startOffset = +item.values[0];
                                        let keyTime = 0, previousRemaining = 0, extendedLength = totalLength, extendedRatio = 1, replaceValue;
                                        if (valueOffset !== startOffset && item.delay === 0 && !item.fillReplace) {
                                            flattenData = this.flattenStrokeDash(flattenData.dashArray, startOffset, totalLength, pathLength);
                                            result = flattenData.items;
                                            dashGroup[0].items = result;
                                            dashTotal = Math.max(dashTotal, flattenData.items.length);
                                            valueOffset = startOffset;
                                        }
                                        if (flattenData.leading > 0 || flattenData.trailing > 0) {
                                            this.extendLength(flattenData, precision);
                                            if (flattenData.path) {
                                                const boxRect = SvgBuild.boxRectOf([this.value]);
                                                extendedLength = truncateFraction(getPathLength(flattenData.path));
                                                extendedRatio = extendedLength / totalLength;
                                                flattenData.extendedLength = this.pathLength;
                                                if (flattenData.extendedLength) {
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
                                        if (item.fillReplace && item.iterationCount !== -1) {
                                            const offsetForward = convertFloat(intervalMap.get(item.attributeName, item.getTotalDuration()));
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
                                        const values = [];
                                        const keyTimes = [];
                                        for (let j = 0, length = keyTimesBase.length; j < length; ++j) {
                                            const offsetFrom = j === 0 ? valueOffset : +valuesBase[j - 1];
                                            const offsetTo = +valuesBase[j];
                                            const offsetValue = Math.abs(offsetTo - offsetFrom);
                                            const keyTimeTo = keyTimesBase[j];
                                            if (offsetValue === 0) {
                                                if (j > 0) {
                                                    keyTime = keyTimeTo;
                                                    keyTimes.push(keyTime);
                                                    const q = values.length;
                                                    if (q) {
                                                        values.push(values[q - 1]);
                                                        previousRemaining = +values[q - 1];
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
                                            let iterationTotal = offsetTotal / extendedLength, offsetRemaining = offsetTotal, finalValue = 0;
                                            const insertFractionKeyTime = () => {
                                                const time = increasing ? '1' : '0';
                                                if (!(j > 0 && values[values.length - 1] === time)) {
                                                    keyTimes.push(keyTime === 0 ? 0 : truncateFraction(keyTime));
                                                    values.push(time);
                                                }
                                            };
                                            const setFinalValue = (offset, checkInvert) => {
                                                finalValue = (offsetRemaining - offset) / extendedLength;
                                                if (checkInvert) {
                                                    const value = truncateFraction(finalValue);
                                                    if (increasing) {
                                                        if (value > 0) {
                                                            finalValue = 1 - finalValue;
                                                        }
                                                    }
                                                    else if (value === 0) {
                                                        finalValue = 1;
                                                    }
                                                }
                                            };
                                            const insertFinalKeyTime = () => {
                                                keyTime = keyTimeTo;
                                                keyTimes.push(keyTime);
                                                const value = truncateFraction(finalValue);
                                                values.push(value.toString());
                                                previousRemaining = value > 0 && value < 1 ? finalValue : 0;
                                            };
                                            const getKeyTimeIncrement = (offset) => ((offset / offsetTotal) * segDuration) / duration;
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
                                                    const remainingValue = truncateFraction(remaining * extendedLength);
                                                    if (lessEqual(offsetRemaining, remainingValue)) {
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
                                                        keyTimes.push(truncateFraction(keyTime));
                                                        iterationTotal = truncateFraction(iterationTotal - remaining);
                                                        offsetRemaining = truncateFraction(offsetRemaining - remainingValue);
                                                    }
                                                }
                                                if (equal(offsetRemaining, extendedLength)) {
                                                    offsetRemaining = extendedLength;
                                                }
                                                if (offsetRemaining > extendedLength) {
                                                    iterationTotal = Math.floor(iterationTotal);
                                                    const iterationOffset = iterationTotal * extendedLength;
                                                    if (iterationOffset === offsetRemaining) {
                                                        --iterationTotal;
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
                                                    keyTimes.push(truncateFraction(keyTime));
                                                    --iterationTotal;
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
                                            item.keySplines = null;
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
                            for (let i = 0, length = dashGroup.length; i < length; ++i) {
                                const { delay, duration, items } = dashGroup[i];
                                if (items === result) {
                                    for (let j = items.length; j < dashTotal; ++j) {
                                        items.push({ start: 1, end: 1 });
                                    }
                                }
                                else {
                                    const baseValue = length > 2 ? this.flattenStrokeDash(getDashArray(intervalMap, valueArray, delay - 1), getDashOffset(intervalMap, valueOffset, delay - 1), totalLength, pathLength).items : result;
                                    for (let j = 0; j < dashTotal; ++j) {
                                        const animate = new SvgAnimation(this.element);
                                        animate.id = j;
                                        animate.attributeName = 'stroke-dasharray';
                                        animate.baseValue = getFromToValue(baseValue[j]);
                                        animate.delay = delay;
                                        animate.duration = duration;
                                        animate.fillFreeze = duration === 0;
                                        animate.to = getFromToValue(items[j]);
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
            return this._transforms || (this._transforms = SvgBuild.filterTransforms(TRANSFORM.parse(this.element) || SvgBuild.convertTransforms(this.element.transform.baseVal)));
        }
        get pathLength() {
            return convertFloat(getNamedItem$1(this.element, 'pathLength'));
        }
        get totalLength() {
            return this.element.getTotalLength();
        }
    }

    class SvgPattern extends SvgView$MX(SvgContainer) {
        constructor(element, patternElement) {
            super(element);
            this.element = element;
            this.patternElement = patternElement;
            this.instanceType = 258 /* SVG_PATTERN */;
        }
        build(options) {
            super.build(Object.assign(Object.assign({}, options), { targetElement: this.patternElement, initialize: false }));
        }
        get animations() {
            return [];
        }
    }

    class SvgShape extends SvgSynchronize$MX(SvgView$MX(SvgElement)) {
        constructor(element, initialize = true) {
            super(element);
            this.element = element;
            this.instanceType = 2052 /* SVG_SHAPE */;
            this._path = null;
            if (initialize) {
                this.setPath();
            }
        }
        setPath() {
            this.path = new SvgPath(this.element);
        }
        build(options) {
            const path = this.path;
            if (path) {
                path.parent = this.parent;
                path.build(Object.assign(Object.assign({}, options), { transforms: this.transforms }));
            }
        }
        synchronize(options) {
            if (this.animations.length) {
                const path = this.path;
                if (path) {
                    const element = options && options.element;
                    if (element) {
                        this.animateSequentially(this.getAnimateShape(element), undefined, path, options);
                    }
                    else {
                        this.animateSequentially(this.getAnimateShape(this.element), this.getAnimateTransform(options), path, options);
                    }
                }
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
    }

    const { getNamedItem } = squared.lib.dom;
    const { convertPercent } = squared.lib.util;
    class SvgShapePattern extends SvgPaint$MX(SvgBaseVal$MX(SvgView$MX(SvgContainer))) {
        constructor(element, patternElement) {
            super(element);
            this.element = element;
            this.patternElement = patternElement;
            this.drawRegion = null;
            this.instanceType = 514 /* SVG_SHAPE_PATTERN */;
            this.patternUnits = getNamedItem(this.patternElement, 'patternUnits') === 'userSpaceOnUse' ? 1 /* USER_SPACE_ON_USE */ : 2 /* OBJECT_BOUNDING_BOX */;
            this.patternContentUnits = getNamedItem(this.patternElement, 'patternContentUnits') === 'objectBoundingBox' ? 2 /* OBJECT_BOUNDING_BOX */ : 1 /* USER_SPACE_ON_USE */;
        }
        build(options) {
            const element = this.element;
            const path = new SvgPath(element);
            path.build(Object.assign({}, options));
            const pathValue = path.value;
            if (pathValue) {
                const precision = options && options.precision;
                this.clipRegion = pathValue;
                if (path.clipPath) {
                    this.clipRegion = path.clipPath;
                }
                const d = [pathValue];
                this.setPaint(d, precision);
                this.drawRegion = SvgBuild.boxRectOf(d);
                const { drawRegion, fillOpacity, patternWidth, patternHeight, tileWidth, tileHeight } = this;
                const boundingBox = this.patternUnits === 2 /* OBJECT_BOUNDING_BOX */;
                let offsetX = this.offsetX % tileWidth, offsetY = this.offsetY % tileHeight, boundingX = 0, boundingY = 0, width = drawRegion.right, remainingHeight = drawRegion.bottom;
                if (boundingBox) {
                    boundingX = drawRegion.left;
                    boundingY = drawRegion.top;
                    width -= boundingX;
                    remainingHeight -= boundingY;
                }
                if (offsetX !== 0) {
                    offsetX = tileWidth - offsetX;
                    width += tileWidth;
                }
                if (offsetY !== 0) {
                    offsetY = tileHeight - offsetY;
                    remainingHeight += tileHeight;
                }
                for (let i = 0; remainingHeight > 0; ++i) {
                    const patternElement = this.patternElement;
                    const contentBoundingBox = this.patternContentUnits === 2 /* OBJECT_BOUNDING_BOX */;
                    const y = boundingY + (i * tileHeight) - offsetY;
                    let remainingWidth = width, j = 0;
                    do {
                        const x = boundingX + (j++ * tileWidth) - offsetX;
                        const pattern = new SvgPattern(element, patternElement);
                        pattern.build(Object.assign({}, options));
                        pattern.cascade(item => {
                            if (SvgBuild.isShape(item)) {
                                item.setPath();
                                const patternPath = item.path;
                                if (patternPath) {
                                    patternPath.patternParent = this;
                                    if (contentBoundingBox) {
                                        patternPath.refitBaseValue(x / patternWidth, y / patternHeight, precision);
                                    }
                                    else {
                                        patternPath.refitBaseValue(x, y, precision);
                                    }
                                    patternPath.build(Object.assign(Object.assign({}, options), { transforms: item.transforms }));
                                    patternPath.fillOpacity = (+patternPath.fillOpacity * +fillOpacity).toString();
                                    patternPath.clipPath = SvgBuild.drawRect(tileWidth, tileHeight, x, y, precision) + (patternPath.clipPath ? ';' + patternPath.clipPath : '');
                                }
                            }
                        });
                        this.add(pattern);
                        remainingWidth -= tileWidth;
                    } while (remainingWidth > 0);
                    remainingHeight -= tileHeight;
                }
                if (this.stroke && +this.strokeWidth > 0) {
                    path.fill = '';
                    path.fillOpacity = '0';
                    path.stroke = this.stroke;
                    path.strokeWidth = this.strokeWidth;
                    const shape = new SvgShape(element, false);
                    shape.path = path;
                    this.add(shape);
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
                for (let i = 0, length = values.length; i < length; ++i) {
                    const pt = values[i];
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
            const drawRegion = this.drawRegion;
            return drawRegion ? drawRegion.right - drawRegion.left : 0;
        }
        get patternHeight() {
            const drawRegion = this.drawRegion;
            return drawRegion ? drawRegion.bottom - drawRegion.top : 0;
        }
        get transforms() {
            if (!this._transforms) {
                this._transforms = super.transforms;
                const transforms = SvgBuild.convertTransforms(this.patternElement.patternTransform.baseVal);
                const length = transforms.length;
                if (length) {
                    const rotateOrigin = TRANSFORM.rotateOrigin(this.patternElement, 'patternTransform');
                    const x = this.patternWidth / 2;
                    const y = this.patternHeight / 2;
                    for (let i = 0; i < length; ++i) {
                        const item = transforms[i];
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
                    this._transforms.push(...SvgBuild.filterTransforms(transforms));
                }
            }
            return this._transforms;
        }
        get offsetX() {
            const baseVal = this.patternElement.x.baseVal;
            return this.patternUnits === 2 /* OBJECT_BOUNDING_BOX */ ? this.patternWidth * convertPercent(baseVal.valueAsString) : baseVal.value;
        }
        get offsetY() {
            const baseVal = this.patternElement.y.baseVal;
            return this.patternUnits === 2 /* OBJECT_BOUNDING_BOX */ ? this.patternHeight * convertPercent(baseVal.valueAsString) : baseVal.value;
        }
        get tileWidth() {
            const baseVal = this.patternElement.width.baseVal;
            return this.patternUnits === 2 /* OBJECT_BOUNDING_BOX */ ? this.patternWidth * convertPercent(baseVal.valueAsString) : baseVal.value;
        }
        get tileHeight() {
            const baseVal = this.patternElement.height.baseVal;
            return this.patternUnits === 2 /* OBJECT_BOUNDING_BOX */ ? this.patternHeight * convertPercent(baseVal.valueAsString) : baseVal.value;
        }
    }

    class SvgUseG extends SvgViewRect$MX(SvgBaseVal$MX(SvgG)) {
        constructor(element, useElement) {
            super(element);
            this.element = element;
            this.useElement = useElement;
            this.instanceType = 115 /* SVG_USE_G */;
            this.useParent = this;
            this.rectElement = useElement;
        }
        build(options) {
            this.setRect();
            super.build(options);
        }
    }

    class SvgUseShape extends SvgPaint$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgShape))) {
        constructor(element, useElement, initialize = true) {
            super(element, false);
            this.element = element;
            this.useElement = useElement;
            this.instanceType = 6149 /* SVG_USE_SHAPE */;
            this.useParent = this;
            this.rectElement = useElement;
            if (initialize) {
                this.setPath();
            }
        }
        setPath() {
            const path = new SvgPath(this.element);
            path.useParent = this;
            this.path = path;
        }
        build(options) {
            super.build(options);
            this.setPaint(this.path && [this.path.value], options && options.precision);
        }
        synchronize(options) {
            options = Object.assign(Object.assign({}, options), { element: this.element });
            if (this.animations.length) {
                this.animateSequentially(this.getAnimateViewRect(), this.getAnimateTransform(options), undefined, options);
            }
            super.synchronize(options);
        }
        getTransforms() {
            return super.getTransforms(this.useElement).concat(super.getTransforms());
        }
        getAnimations() {
            return super.getAnimations(this.useElement).concat(super.getAnimations());
        }
    }

    class SvgUseShapePattern extends SvgSynchronize$MX(SvgViewRect$MX(SvgShapePattern)) {
        constructor(element, useElement, patternElement) {
            super(element, patternElement);
            this.element = element;
            this.useElement = useElement;
            this.instanceType = 1539 /* SVG_USE_SHAPE_PATTERN */;
            this.useParent = this;
            this.rectElement = useElement;
        }
        synchronize(options) {
            const animations = this.animations.filter(item => item.attributeName === 'x' || item.attributeName === 'y' || this.verifyBaseValue(item.attributeName, 0) > 0);
            const transforms = this.getAnimateTransform(options);
            if (animations.length || transforms.length) {
                this.animateSequentially(this.getAnimateViewRect(animations), transforms, undefined, options);
            }
            super.synchronize(options);
        }
    }

    class SvgUseSymbol extends SvgPaint$MX(SvgSynchronize$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgView$MX(SvgContainer))))) {
        constructor(symbolElement, useElement) {
            super(useElement);
            this.symbolElement = symbolElement;
            this.useElement = useElement;
            this.instanceType = 131 /* SVG_USE_SYMBOL */;
            this.useParent = this;
            this.rectElement = useElement;
        }
        build(options) {
            this.setRect();
            super.build(Object.assign(Object.assign({}, options), { targetElement: this.symbolElement }));
            this.setPaint(this.getPathAll(), options && options.precision);
        }
        synchronize(options) {
            if (this.animations.length) {
                this.animateSequentially(this.getAnimateViewRect(), this.getAnimateTransform(options), undefined, options);
            }
            super.synchronize(options);
        }
        get viewBox() {
            return this.symbolElement.viewBox.baseVal || { x: 0, y: 0, width: 0, height: 0 };
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
    exports.SvgUseG = SvgUseG;
    exports.SvgUseShape = SvgUseShape;
    exports.SvgUseShapePattern = SvgUseShapePattern;
    exports.SvgUseSymbol = SvgUseSymbol;
    exports.SvgView = SvgView$MX;
    exports.SvgViewRect = SvgViewRect$MX;
    exports.lib = lib;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));
