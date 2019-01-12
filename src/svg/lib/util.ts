import { SvgMatrix, SvgPoint, SvgTransform } from '../@types/object';

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

export const SHAPES = {
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

function getFontSize(element: SVGGraphicsElement) {
    return parseInt($dom.getStyle(element).fontSize || '16');
}

function setAttribute(element: SVGGraphicsElement, attr: string, value: string) {
    element.style[attr] = value;
    element.setAttribute(attr, value);
}

export const MATRIX = {
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

export function getParentViewBox(element: SVGGraphicsElement): SVGSVGElement | SVGSymbolElement | null {
    let current: SVGGraphicsElement | HTMLElement | null = element;
    while (current) {
        switch (current.tagName) {
            case 'svg':
            case 'symbol':
                return <SVGSVGElement> current;
        }
        current = current.parentElement;
    }
    return null;
}

export function getSvgViewport(element: SVGGraphicsElement) {
    const result: SVGGraphicsElement[] = [];
    let parent = element.parentElement;
    while (parent) {
        result.push(<SVGGraphicsElement> (parent as unknown));
        parent = parent.parentElement;
        if (parent instanceof HTMLElement) {
            break;
        }
    }
    return result;
}

export const SVG = {
    svg: (element: Element | null): element is SVGSVGElement => {
        return !!element && element.tagName === 'svg';
    },
    g: (element: Element | null): element is SVGSVGElement => {
        return !!element && element.tagName === 'g';
    },
    use: (element: Element | null): element is SVGUseElement => {
        return !!element && element.tagName === 'use';
    },
    symbol: (element: Element): element is SVGSymbolElement => {
        return element.tagName === 'symbol';
    },
    shape: (element: Element): element is SVGGraphicsElement => {
        return SHAPES[element.tagName] !== undefined;
    },
    image: (element: Element): element is SVGImageElement => {
        return element.tagName === 'image';
    },
    path: (element: Element): element is SVGPathElement => {
        return element.tagName === 'path';
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
    linearGradient: (element: Element): element is SVGLinearGradientElement => {
        return element.tagName === 'linearGradient';
    },
    radialGradient: (element: Element): element is SVGRadialGradientElement => {
        return element.tagName === 'radialGradient';
    }
};

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

export function getHrefTargetElement(element: Element, parentElement?: SVGElement | HTMLElement | null) {
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

export function getTransformMatrix(element: SVGGraphicsElement): SvgMatrix | undefined {
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

export function convertAngle(value: string, unit = 'deg') {
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

export function createTransform(type: number, matrix: SvgMatrix | DOMMatrix, angle = 0, x = true, y = true): SvgTransform {
    return {
        type,
        matrix,
        angle,
        method: { x, y }
    };
}

export function getRotateOrigin(element: SVGGraphicsElement): SvgPoint[] {
    const result: SvgPoint[] = [];
    const transform = element.attributes.getNamedItem('transform');
    if (transform) {
        const pattern = /rotate\((-?[\d.]+),?\s*(-?[\d.]+),?\s*(-?[\d.]+)\)/g;
        let match: RegExpExecArray | null = null;
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

export function getTransform(element: SVGGraphicsElement): SvgTransform[] | undefined {
    const value = $dom.cssInline(element, 'transform');
    if (value !== '') {
        const result: SvgTransform[] = [];
        for (const name in REGEX_TRANSFORM) {
            const pattern = new RegExp(REGEX_TRANSFORM[name], 'g');
            let match: RegExpExecArray | null = null;
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
                        result[match.index] = createTransform(SVGTransform.SVG_TRANSFORM_SKEWX, { ...matrix, b: 0 }, x, true, false);
                        if (y !== 0) {
                            result[match.index + 1] = createTransform(SVGTransform.SVG_TRANSFORM_SKEWY, { ...matrix, c: 0 }, y, false, true);
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

export function getTransformOrigin(element: SVGGraphicsElement) {
    const value = $dom.cssAttribute(element, 'transform-origin', true);
    if (value !== '') {
        const parent = element.parentElement;
        let width: number;
        let height: number;
        if (SVG.svg(parent)) {
            width = parent.viewBox.baseVal.width;
            height = parent.viewBox.baseVal.height;
        }
        else if (SVG.g(parent) && SVG.svg(parent.viewportElement)) {
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
        const origin: Nullable<Point> = { x: null, y: null };
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
            return <Point> origin;
        }
    }
    return undefined;
}

export function sortNumber(values: number[], descending = false) {
    return descending ? values.sort((a, b) => a > b ? -1 : 1) : values.sort((a, b) => a < b ? -1 : 1);
}

export function getLeastCommonMultiple(values: number[]) {
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

export function applyMatrixX(matrix: SvgMatrix | DOMMatrix, x: number, y: number) {
    return matrix.a * x + matrix.c * y + matrix.e;
}

export function applyMatrixY(matrix: SvgMatrix | DOMMatrix, x: number, y: number) {
    return matrix.b * x + matrix.d * y + matrix.f;
}

export function getRadiusX(angle: number, radius: number) {
    return radius * Math.sin(convertRadian(angle));
}

export function getRadiusY(angle: number, radius: number) {
    return radius * Math.cos(convertRadian(angle)) * -1;
}

export function convertRadian(angle: number) {
    return angle * Math.PI / 180;
}