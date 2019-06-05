import { SvgMatrix, SvgPoint, SvgTransform } from '../@types/object';

const $const = squared.lib.constant;
const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $math = squared.lib.math;
const $regex = squared.lib.regex;
const $session = squared.lib.session;
const $util = squared.lib.util;

const STRING_DECIMAL = `(${$regex.STRING.DECIMAL})`;
const REGEXP_TRANSFORM = {
    MATRIX: new RegExp(`(matrix(?:3d)?)\\(${STRING_DECIMAL}, ${STRING_DECIMAL}, ${STRING_DECIMAL}, ${STRING_DECIMAL}, ${STRING_DECIMAL}, ${STRING_DECIMAL}(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?\\)`, 'g'),
    ROTATE: new RegExp(`(rotate[XY]?)\\(${$regex.STRING.CSS_ANGLE}\\)`, 'g'),
    SKEW: new RegExp(`(skew[XY]?)\\(${$regex.STRING.CSS_ANGLE}(?:, ${$regex.STRING.CSS_ANGLE})?\\)`, 'g'),
    SCALE: new RegExp(`(scale[XY]?)\\(${STRING_DECIMAL}(?:, ${STRING_DECIMAL})?\\)`, 'g'),
    TRANSLATE: new RegExp(`(translate[XY]?)\\(${$regex.STRING.LENGTH_PERCENTAGE}(?:, ${$regex.STRING.LENGTH_PERCENTAGE})?\\)`, 'g')
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
    skew(x = 0, y = 0): SvgMatrix {
        return {
            a: 1,
            b: Math.tan($math.convertRadian(y)),
            c: Math.tan($math.convertRadian(x)),
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
        const transform = value || element.style.getPropertyValue('transform');
        if (transform !== '') {
            const ordered: SvgTransform[] = [];
            for (const name in REGEXP_TRANSFORM) {
                let match: RegExpExecArray | null;
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
        const match = new RegExp(REGEXP_TRANSFORM.MATRIX).exec(value || $css.getStyle(element).transform || '');
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
            function setPosition(attr: string, position: string, dimension: number) {
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
                positions.push($const.CSS.CENTER);
            }
            switch (positions[0]) {
                case $const.CSS.PERCENT_0:
                case $const.CSS.LEFT:
                    break;
                case $const.CSS.PERCENT_100:
                case $const.CSS.RIGHT:
                    result.x = width;
                    break;
                case $const.CSS.CENTER:
                    positions[0] = $const.CSS.PERCENT_50;
                default:
                    setPosition('x', positions[0], width);
                    break;
            }
            switch (positions[1]) {
                case $const.CSS.PERCENT_0:
                case $const.CSS.TOP:
                    break;
                case $const.CSS.PERCENT_100:
                case $const.CSS.BOTTOM:
                    result.y = height;
                    break;
                case $const.CSS.CENTER:
                    positions[1] = $const.CSS.PERCENT_50;
                default:
                    setPosition('y', positions[1], height);
                    break;
            }
        }
        return result;
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

export function getDOMRect(element: SVGElement) {
    const result: Partial<DOMRect> = element.getBoundingClientRect();
    result.x = result.left;
    result.y = result.top;
    return <DOMRect> result;
}

export function getAttribute(element: SVGElement, attr: string, computed = true) {
    let value = $dom.getNamedItem(element, attr);
    if (value === '') {
        const styleMap: StringMap = $session.getElementCache(element, 'styleMap');
        if (styleMap) {
            value = styleMap[$util.convertCamelCase(attr)] || '';
        }
        if (value === '' && (computed || Array.from(element.style).includes(attr))) {
            value = $css.getStyle(element).getPropertyValue(attr);
        }
    }
    return value.trim();
}

export function getParentAttribute(element: SVGElement, attr: string, computed = true) {
    let current: HTMLElement | SVGElement | null = element;
    let value = '';
    while (current && !(current instanceof HTMLElement)) {
        value = getAttribute(<SVGElement> current, attr, computed);
        if (value !== '' && value !== 'inherit') {
            break;
        }
        current = current.parentElement;
    }
    return value;
}

export function getAttributeURL(value: string) {
    const match = $regex.CSS.URL.exec(value);
    return match ? match[1] : '';
}

export function getTargetElement(element: SVGElement, rootElement?: SVGElement) {
    const value = $dom.getNamedItem(element, 'href');
    if (value.charAt(0) === '#') {
        const id = value.substring(1);
        let parent: SVGElement | HTMLElement | null;
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
                const target = elements[i];
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
        if ((SVG.svg(current) || SVG.symbol(current)) && current.viewBox && current.viewBox.baseVal.width > 0 && current.viewBox.baseVal.height > 0) {
            return current.viewBox.baseVal;
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