import type { SvgMatrix, SvgPoint, SvgTransform } from '../../../@types/svg/object';

const $lib = squared.lib;

const { CSS_UNIT, calculateStyle: calculateCssStyle, calculateVar, convertAngle, getFontSize, isLength, isPercent, parseUnit } = $lib.css;
const { getNamedItem } = $lib.dom;
const { clamp, convertRadian, hypotenuse } = $lib.math;
const { CSS, STRING } = $lib.regex;
const { getStyleValue } = $lib.session;
const { convertCamelCase, convertFloat, isString } = $lib.util;

const STRING_DECIMAL = `(${STRING.DECIMAL})`;
const SHAPES = {
    path: 1,
    line: 2,
    rect: 3,
    ellipse: 4,
    circle: 5,
    polyline: 6,
    polygon: 7
};
const REGEX_TRANSFORM = {
    MATRIX: new RegExp(`(matrix(?:3d)?)\\(${STRING_DECIMAL}, ${STRING_DECIMAL}, ${STRING_DECIMAL}, ${STRING_DECIMAL}, ${STRING_DECIMAL}, ${STRING_DECIMAL}(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?\\)`, 'g'),
    ROTATE: new RegExp(`(rotate[XY]?)\\(${STRING.CSS_ANGLE}\\)`, 'g'),
    SKEW: new RegExp(`(skew[XY]?)\\(${STRING.CSS_ANGLE}(?:, ${STRING.CSS_ANGLE})?\\)`, 'g'),
    SCALE: new RegExp(`(scale[XY]?)\\(${STRING_DECIMAL}(?:, ${STRING_DECIMAL})?\\)`, 'g'),
    TRANSLATE: new RegExp(`(translate[XY]?)\\(${STRING.LENGTH_PERCENTAGE}(?:, ${STRING.LENGTH_PERCENTAGE})?\\)`, 'g')
};
const REGEX_ROTATEORIGIN = /rotate\((-?[\d.]+)(?:,? (-?[\d.]+))?(?:,? (-?[\d.]+))?\)/g;

function setOriginPosition(element: Element, point: Point, attr: string, position: string, dimension: number) {
    if (isLength(position)) {
        point[attr] = parseUnit(position, getFontSize(element));
    }
    else if (isPercent(position)) {
        point[attr] = (parseFloat(position) / 100) * dimension;
    }
}

function getDataSetValue(element: SVGElement, attr: string) {
    const data = element.dataset.baseValue;
    if (data) {
        try {
            const obj: ObjectMap<any> = JSON.parse(data);
            if (obj) {
                return obj[attr]?.toString().trim() || '';
            }
        }
        catch {
        }
    }
    return '';
}

export const SVG = {
    svg: (element: Element): element is SVGSVGElement => {
        return element.tagName === 'svg';
    },
    g: (element: Element): element is SVGGElement => {
        return element.tagName === 'g';
    },
    symbol: (element: Element): element is SVGSymbolElement => {
        return element.tagName === 'symbol';
    },
    path: (element: Element): element is SVGPathElement => {
        return element.tagName === 'path';
    },
    shape: (element: Element): element is SVGGeometryElement => {
        return element.tagName in SHAPES;
    },
    image: (element: Element): element is SVGImageElement => {
        return element.tagName === 'image';
    },
    use: (element: Element): element is SVGUseElement => {
        return element.tagName === 'use';
    },
    line: (element: Element): element is SVGLineElement => {
        return element.tagName === 'line';
    },
    rect: (element: Element): element is SVGRectElement => {
        return element.tagName === 'rect';
    },
    circle: (element: Element): element is SVGCircleElement => {
        return element.tagName === 'circle';
    },
    ellipse: (element: Element): element is SVGEllipseElement => {
        return element.tagName === 'ellipse';
    },
    polygon: (element: Element): element is SVGPolygonElement => {
        return element.tagName === 'polygon';
    },
    polyline: (element: Element): element is SVGPolylineElement => {
        return element.tagName === 'polyline';
    },
    clipPath: (element: Element): element is SVGClipPathElement => {
        return element.tagName === 'clipPath';
    },
    pattern: (element: Element): element is SVGPatternElement => {
        return element.tagName === 'pattern';
    },
    linearGradient: (element: Element): element is SVGLinearGradientElement => {
        return element.tagName === 'linearGradient';
    },
    radialGradient: (element: Element): element is SVGRadialGradientElement => {
        return element.tagName === 'radialGradient';
    }
};

export const MATRIX = {
    applyX(matrix: SvgMatrix | DOMMatrix, x: number, y: number) {
        return matrix.a * x + matrix.c * y + matrix.e;
    },
    applyY(matrix: SvgMatrix | DOMMatrix, x: number, y: number) {
        return matrix.b * x + matrix.d * y + matrix.f;
    },
    clone(matrix: SvgMatrix | DOMMatrix) {
        return {
            a: matrix.a,
            b: matrix.b,
            c: matrix.c,
            d: matrix.d,
            e: matrix.e,
            f: matrix.f
        };
    },
    rotate(angle: number): SvgMatrix {
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
    skew(x = 0, y = 0): SvgMatrix {
        return {
            a: 1,
            b: Math.tan(convertRadian(y)),
            c: Math.tan(convertRadian(x)),
            d: 1,
            e: 0,
            f: 0
        };
    },
    scale(x = 1, y = 1): SvgMatrix {
        return {
            a: x,
            b: 0,
            c: 0,
            d: y,
            e: 0,
            f: 0
        };
    },
    translate(x = 0, y = 0): SvgMatrix {
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

export const TRANSFORM = {
    create(type: number, matrix: SvgMatrix | DOMMatrix, angle = 0, x = true, y = true): SvgTransform {
        return {
            type,
            matrix,
            angle,
            method: { x, y }
        };
    },
    parse(element: SVGElement, value?: string): Undef<SvgTransform[]> {
        const transform = value || element.style.getPropertyValue('transform');
        if (transform !== '') {
            const ordered: SvgTransform[] = [];
            for (const name in REGEX_TRANSFORM) {
                const pattern = REGEX_TRANSFORM[name];
                let match: Null<RegExpExecArray>;
                while ((match = pattern.exec(transform)) !== null) {
                    const index = match.index;
                    const attr = match[1];
                    const isX = /X$/.test(attr);
                    const isY = /Y$/.test(attr);
                    if (/^rotate/.test(attr)) {
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
                        ordered[index] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_ROTATE, matrix, angle, !isX, !isY);
                    }
                    else if (/^skew/.test(attr)) {
                        const angle = convertAngle(match[2], match[3]);
                        const x = isY ? 0 : angle;
                        const y = isY ? angle : (match[4] && match[5] ? convertAngle(match[4], match[5]) : 0);
                        const matrix = MATRIX.skew(x, y);
                        if (isX) {
                            ordered[index] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SKEWX, matrix, x, true, false);
                        }
                        else if (isY) {
                            ordered[index] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SKEWY, matrix, y, false, true);
                        }
                        else {
                            ordered[index] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SKEWX, { ...matrix, b: 0 }, x, true, false);
                            if (y !== 0) {
                                ordered[index + 1] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SKEWY, { ...matrix, c: 0 }, y, false, true);
                            }
                        }
                    }
                    else if (/^scale/.test(attr)) {
                        const x = isY ? undefined : parseFloat(match[2]);
                        const y = isY ? parseFloat(match[2]) : (!isX && match[3] ? parseFloat(match[3]) : x);
                        ordered[index] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SCALE, MATRIX.scale(x, isX ? undefined : y), 0, !isY, !isX);
                    }
                    else if (/^translate/.test(attr)) {
                        const fontSize = getFontSize(element);
                        const arg1 = parseUnit(match[2], fontSize);
                        const arg2 = !isX && match[3] ? parseUnit(match[3], fontSize) : 0;
                        const x = isY ? 0 : arg1;
                        const y = isY ? arg1 : arg2;
                        ordered[index] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_TRANSLATE, MATRIX.translate(x, y), 0);
                    }
                    else if (/^matrix/.test(attr)) {
                        const matrix = TRANSFORM.matrix(element, value);
                        if (matrix) {
                            ordered[index] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_MATRIX, matrix);
                        }
                    }
                }
                pattern.lastIndex = 0;
            }
            const result: SvgTransform[] = [];
            ordered.forEach(item => {
                item.fromCSS = true;
                result.push(item);
            });
            return result;
        }
        return undefined;
    },
    matrix(element: SVGElement, value?: string): Undef<SvgMatrix> {
        REGEX_TRANSFORM.MATRIX.lastIndex = 0;
        const match = REGEX_TRANSFORM.MATRIX.exec(value || getComputedStyle(element).transform);
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
    origin(element: SVGElement, value?: string) {
        if (value === undefined) {
            value = getAttribute(element, 'transform-origin');
        }
        const result: Point = { x: 0, y: 0 };
        if (value !== '') {
            const viewBox = getNearestViewBox(element);
            let width: Undef<number>;
            let height: Undef<number>;
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
    rotateOrigin(element: SVGElement, attr = 'transform'): SvgPoint[] {
        const value = getNamedItem(element, attr);
        const result: SvgPoint[] = [];
        if (value !== '') {
            let match: Null<RegExpExecArray>;
            while ((match = REGEX_ROTATEORIGIN.exec(value)) !== null) {
                const angle = parseFloat(match[1]);
                if (angle !== 0) {
                    result.push({
                        angle,
                        x: convertFloat(match[2]),
                        y: convertFloat(match[3])
                    });
                }
            }
            REGEX_ROTATEORIGIN.lastIndex = 0;
        }
        return result;
    },
    typeAsName(type: number) {
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
    typeAsValue(type: string | number) {
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

export function getDOMRect(element: SVGElement) {
    const result: Partial<DOMRect> = element.getBoundingClientRect();
    result.x = result.left;
    result.y = result.top;
    return <DOMRect> result;
}

export function calculateStyle(element: SVGElement, attr: string, value: string) {
    attr = convertCamelCase(attr);
    switch (attr) {
        case 'clipPath':
        case 'height':
        case 'offsetAnchor':
        case 'offsetPath':
        case 'transform':
        case 'transformOrigin':
        case 'width':
            return calculateCssStyle(element, attr, value, getNearestViewBox(element));
        case 'animationDelay':
        case 'animationDuration':
        case 'animationIterationCount':
        case 'offsetDistance':
        case 'offsetRotate':
            return calculateCssStyle(element, attr, value);
        case 'fill':
        case 'stroke':
            return calculateCssStyle(element, 'fontColor', value);
        case 'fillOpacity':
        case 'strokeOpacity': {
            const result = calculateVar(element, value, { boundingSize: 1, unitType: CSS_UNIT.DECIMAL });
            return !isNaN(result) ? clamp(result).toString() : '';
        }
        case 'strokeMiterlimit': {
            const result = calculateVar(element, value, { supportPercent: false, unitType: CSS_UNIT.DECIMAL, min: 1 });
            return !isNaN(result) ? result.toString() : '';
        }
    }
    const viewBox = getNearestViewBox(element) || element.getBoundingClientRect();
    const getViewportArea = (min: boolean) => {
        const { width, height } = viewBox;
        return min ? Math.min(width, height) : hypotenuse(width, height);
    };
    switch (attr) {
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
            const result = calculateVar(element, value, { boundingSize: getViewportArea(true), min: 0 });
            return !isNaN(result) ? result.toString() : '0';
        }
        case 'rx': {
            const result = calculateVar(element, value, { boundingSize: viewBox.width, min: 0 });
            if (!isNaN(result)) {
                return SVG.rect(element) ? Math.min(result, viewBox.width / 2).toString() : result.toString();
            }
            return '0';
        }
        case 'ry': {
            const result = calculateVar(element, value, { boundingSize: viewBox.height, min: 0 });
            if (!isNaN(result)) {
                return SVG.rect(element) ? Math.min(result, viewBox.height / 2).toString() : result.toString();
            }
            return '0';
        }
        case 'strokeDashoffset': {
            const result = calculateVar(element, value, { boundingSize: getViewportArea(true), unitType: CSS_UNIT.DECIMAL });
            return !isNaN(result) ? result.toString() : '';
        }
        case 'strokeWidth': {
            const result = calculateVar(element, value, { boundingSize: getViewportArea(false), unitType: CSS_UNIT.DECIMAL, min: 0 });
            return !isNaN(result) ? result.toString() : '';
        }
    }
    return '';
}

export function getAttribute(element: SVGElement, attr: string, computed = false) {
    let value: string;
    if (computed) {
        value = getNamedItem(element, attr) || getStyleValue(element, attr);
    }
    else {
        value = getStyleValue(element, attr) || getDataSetValue(element, attr) || getNamedItem(element, attr);
    }
    if (!isString(value) && (computed || Array.from(element.style).includes(attr))) {
        value = getComputedStyle(element).getPropertyValue(attr);
    }
    return value || '';
}

export function getParentAttribute(element: SVGElement, attr: string, computed = true) {
    let current: Null<CSSElement> = element;
    let value: string;
    do {
        value = getAttribute(current, attr, computed);
        if (value !== '' && value !== 'inherit') {
            break;
        }
        current = current.parentElement;
    }
    while (current && !(current instanceof HTMLElement));
    return value;
}

export function getAttributeURL(value: string) {
    return CSS.URL.exec(value)?.[1] || '';
}

export function getTargetElement(element: SVGElement, rootElement?: SVGElement) {
    const value = getNamedItem(element, 'href');
    if (value.charAt(0) === '#') {
        const id = value.substring(1);
        let parent: Null<SVGElement | HTMLElement>;
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

export function getNearestViewBox(element: SVGElement) {
    let current = element.parentElement;
    while (current) {
        if (SVG.svg(current) || SVG.symbol(current)) {
            const viewBox = current.viewBox;
            if (viewBox) {
                const baseVal = viewBox.baseVal;
                if (baseVal.width > 0 && baseVal.height > 0) {
                    return baseVal;
                }
            }
        }
        current = current.parentElement;
    }
    return undefined;
}

export function createPath(value: string) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    element.setAttribute('d', value);
    return element;
}

export function getPathLength(value: string) {
    const element = createPath(value);
    return element.getTotalLength();
}