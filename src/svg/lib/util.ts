import { SvgMatrix, SvgPoint, SvgTransform } from '../@types/object';

const $dom = squared.lib.dom;
const $util = squared.lib.util;

function setAttribute(element: SVGElement, attr: string, value: string) {
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

const REGEXP_TRANSFORM = {
    MATRIX: `(matrix(?:3d)?)\\(${$util.REGEXP_STRING.DECIMAL}, ${$util.REGEXP_STRING.DECIMAL}, ${$util.REGEXP_STRING.DECIMAL}, ${$util.REGEXP_STRING.DECIMAL}, ${$util.REGEXP_STRING.DECIMAL}, ${$util.REGEXP_STRING.DECIMAL}(?:, ${$util.REGEXP_STRING.DECIMAL})?(?:, ${$util.REGEXP_STRING.DECIMAL})?(?:, ${$util.REGEXP_STRING.DECIMAL})?(?:, ${$util.REGEXP_STRING.DECIMAL})?(?:, ${$util.REGEXP_STRING.DECIMAL})?(?:, ${$util.REGEXP_STRING.DECIMAL})?(?:, ${$util.REGEXP_STRING.DECIMAL})?(?:, ${$util.REGEXP_STRING.DECIMAL})?(?:, ${$util.REGEXP_STRING.DECIMAL})?(?:, ${$util.REGEXP_STRING.DECIMAL})?\\)`,
    ROTATE: `(rotate[XY]?)\\(${$util.REGEXP_STRING.DEGREE}\\)`,
    SKEW: `(skew[XY]?)\\(${$util.REGEXP_STRING.DEGREE}(?:, ${$util.REGEXP_STRING.DEGREE})?\\)`,
    SCALE: `(scale[XY]?)\\(${$util.REGEXP_STRING.DECIMAL}(?:, ${$util.REGEXP_STRING.DECIMAL})?\\)`,
    TRANSLATE: `(translate[XY]?)\\(${$util.REGEXP_STRING.LENGTH}(?:, ${$util.REGEXP_STRING.LENGTH})?\\)`
};

export const MATRIX = {
    applyX(matrix: SvgMatrix | DOMMatrix, x: number, y: number) {
        return matrix.a * x + matrix.c * y + matrix.e;
    },
    applyY(matrix: SvgMatrix | DOMMatrix, x: number, y: number) {
        return matrix.b * x + matrix.d * y + matrix.f;
    },
    distance(angle: number, value: number) {
        return value * Math.cos($util.convertRadian(angle)) * -1;
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
    skew(x = 0, y = 0): SvgMatrix {
        return {
            a: 1,
            b: Math.tan($util.convertRadian(y)),
            c: Math.tan($util.convertRadian(x)),
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
    parse(element: SVGElement, value?: string): SvgTransform[] | undefined {
        const transform = value === undefined ? $dom.cssInline(element, 'transform') : value;
        if (transform !== '') {
            const ordered: SvgTransform[] = [];
            for (const name in REGEXP_TRANSFORM) {
                const pattern = new RegExp(REGEXP_TRANSFORM[name], 'g');
                let match: RegExpExecArray | null = null;
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
                        ordered[match.index] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_ROTATE, matrix, angle, !isX, !isY);
                    }
                    else if (match[1].startsWith('skew')) {
                        const x = isY ? 0 : $util.convertAngle(match[2], match[3]);
                        const y = isY ? $util.convertAngle(match[2], match[3]) : (match[4] && match[5] ? $util.convertAngle(match[4], match[5]) : 0);
                        const matrix = MATRIX.skew(x, y);
                        if (isX) {
                            ordered[match.index] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SKEWX, matrix, x, true, false);
                        }
                        else if (isY) {
                            ordered[match.index] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SKEWY, matrix, y, false, true);
                        }
                        else {
                            ordered[match.index] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SKEWX, { ...matrix, b: 0 }, x, true, false);
                            if (y !== 0) {
                                ordered[match.index + 1] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SKEWY, { ...matrix, c: 0 }, y, false, true);
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
                        const fontSize = getFontSize(element);
                        const arg1 = parseFloat($util.convertPX(match[2], fontSize));
                        const arg2 = (!isX && match[3] ? parseFloat($util.convertPX(match[3], fontSize)) : 0);
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
            const result: SvgTransform[] = [];
            ordered.forEach(item => {
                item.fromCSS = true;
                result.push(item);
            });
            return result;
        }
        return undefined;
    },
    matrix(element: SVGElement, value?: string): SvgMatrix | undefined {
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
    origin(element: SVGElement, value?: string) {
        if (value === undefined) {
            value = $dom.cssAttribute(element, 'transform-origin');
        }
        const result: Nullable<Point> = { x: null, y: null };
        if (value !== '') {
            const viewBox = getNearestViewBox(element);
            let width!: number;
            let height!: number;
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
            function setPosition(attr: string) {
                if (result[attr] === null) {
                    for (let i = 0; i < positions.length; i++) {
                        let position = positions[i];
                        if (position !== '') {
                            if (position === 'center') {
                                position = '50%';
                            }
                            if ($util.isUnit(position)) {
                                result[attr] = parseInt(position.endsWith('px') ? position : $util.convertPX(position, getFontSize(element)));
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
            }
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
            setPosition('x');
            setPosition('y');
        }
        result.x = result.x || 0;
        result.y = result.y || 0;
        return <Point> result;
    },
    rotateOrigin(element: SVGElement, attr = 'transform'): SvgPoint[] {
        const value = $dom.getNamedItem(element, attr);
        const result: SvgPoint[] = [];
        if (value !== '') {
            const pattern = /rotate\((-?[\d.]+)(?:,? (-?[\d.]+))?(?:,? (-?[\d.]+))?\)/g;
            let match: RegExpExecArray | null;
            while ((match = pattern.exec(value)) !== null) {
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
        }
        return '';
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
        }
        return '';
    }
};

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
    shape: (element: Element): element is SVGGraphicsElement => {
        return SHAPES[element.tagName] !== undefined;
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

export function getFontSize(element: SVGElement | null) {
    return parseInt($dom.getStyle(element).fontSize || '16');
}

export function convertClockTime(value: string) {
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

export function isVisible(element: Element) {
    const value = $dom.cssAttribute(element, 'visibility', true);
    return value !== 'hidden' && value !== 'collapse' && $dom.cssAttribute(element, 'display', true) !== 'none';
}

export function setVisible(element: SVGGraphicsElement, value: boolean) {
    setAttribute(element, 'display', value ? 'block' : 'none');
    setAttribute(element, 'visibility', value ? 'visible' : 'hidden');
}

export function setOpacity(element: SVGGraphicsElement, value: string) {
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

export function getAttributeUrl(value: string) {
    const match = /url\("?(#.+?)"?\)/.exec(value);
    return match ? match[1] : '';
}

export function getTargetElement(element: Element, rootElement?: SVGElement) {
    const value = $dom.getNamedItem(element, 'href');
    if (value.charAt(0) === '#') {
        const id = value.substring(1);
        let parent: SVGElement | HTMLElement | null;
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
            const elements = parent.querySelectorAll('*');
            for (let i = 0; i < elements.length; i++) {
                if (elements[i].id === id && elements[i] instanceof SVGElement) {
                    return elements[i];
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
        if ((SVG.svg(current) || SVG.symbol(current)) && current.viewBox && current.viewBox.baseVal.width > 0 && current.viewBox.baseVal.height > 0) {
            return current.viewBox.baseVal;
        }
        current = current.parentElement;
    }
    return undefined;
}

export function sortNumber(values: number[], descending = false) {
    return descending ? values.sort((a, b) => a > b ? -1 : 1) : values.sort((a, b) => a < b ? -1 : 1);
}

export function getSplitValue(value: number, next: number, percent: number) {
    return value + (next - value) * percent;
}

export function getLeastCommonMultiple(values: number[], offset?: number[]) {
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