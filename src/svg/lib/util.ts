import Pattern = squared.lib.base.Pattern;

const { CSS_UNIT, calculateStyle: calculateCssStyle, calculateVar, calculateVarAsString, convertAngle, getFontSize, hasEm, isLength, isPercent, parseUnit } = squared.lib.css;
const { getNamedItem } = squared.lib.dom;
const { clamp, convertRadian, hypotenuse } = squared.lib.math;
const { TRANSFORM: REGEXP_TRANSFORM } = squared.lib.regex;
const { getElementCache } = squared.lib.session;
const { convertCamelCase, resolvePath, splitPair } = squared.lib.util;

const RE_PARSE = new Pattern(/(\w+)\([^)]+\)/g);
const RE_ROTATE = new Pattern(/rotate\((-?[\d.]+)(?:,?\s+(-?[\d.]+))?(?:,?\s+(-?[\d.]+))?\)/g);

function setOriginPosition(element: Element, point: Point, attr: string, value: string, dimension: number) {
    if (isLength(value)) {
        point[attr] = parseUnit(value, createParseUnitOptions(element, value));
    }
    else if (isPercent(value)) {
        point[attr] = parseFloat(value) / 100 * dimension;
    }
}

function getDataSetValue(element: SVGElement, attr: string) {
    const data = element.dataset.baseValue;
    if (data) {
        try {
            const obj: SvgDataSet = JSON.parse(data);
            if (obj) {
                return obj[attr]?.toString().trim() as string || '';
            }
        } catch {
        }
    }
    return '';
}

function getStyleValue(element: Element, attr: string) {
    const styleMap = getElementCache<StringMap>(element, 'styleMap');
    return styleMap && styleMap[convertCamelCase(attr)] || '';
}

const getViewportArea = (viewBox: DOMRect, min?: boolean) => min ? Math.min(viewBox.width, viewBox.height) : hypotenuse(viewBox.width, viewBox.height);
const createParseUnitOptions = (element: Element, value: string): Undef<ParseUnitOptions> => hasEm(value) ? { fontSize: getFontSize(element) } : undefined;

export const CACHE_VIEWNAME = new Map<string, number>();

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
    parse(element: SVGElement, value?: string): Null<SvgTransform[]> {
        if (!value) {
            value = element.style.getPropertyValue('transform');
        }
        if (value) {
            const result: SvgTransform[] = [];
            RE_PARSE.matcher(value);
            while (RE_PARSE.find()) {
                const [transform, method] = RE_PARSE.groups();
                const isX = method.endsWith('X');
                const isY = !isX && method.endsWith('Y');
                if (method.startsWith('translate')) {
                    const translate = REGEXP_TRANSFORM.TRANSLATE.exec(transform);
                    if (translate) {
                        const arg1 = parseUnit(translate[2], createParseUnitOptions(element, translate[2]));
                        const arg2 = !isX && translate[3] ? parseUnit(translate[3], createParseUnitOptions(element, translate[3])) : 0;
                        const x = isY ? 0 : arg1;
                        const y = isY ? arg1 : arg2;
                        result.push(TRANSFORM.create(SVGTransform.SVG_TRANSFORM_TRANSLATE, MATRIX.translate(x, y), 0));
                    }
                }
                else if (method.startsWith('rotate')) {
                    const rotate = REGEXP_TRANSFORM.ROTATE.exec(transform);
                    if (rotate) {
                        const angle = convertAngle(rotate[2], rotate[3]);
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
                else if (method.startsWith('scale')) {
                    const scale = REGEXP_TRANSFORM.SCALE.exec(transform);
                    if (scale) {
                        const x = isY ? 1 : parseFloat(scale[2]);
                        const y = isX ? 1 : isY ? parseFloat(scale[2]) : !isX && scale[3] ? parseFloat(scale[3]) : x;
                        result.push(TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SCALE, MATRIX.scale(x, y), 0, !isY, !isX));
                    }
                }
                else if (method.startsWith('skew')) {
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
                            result.push(TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SKEWX, { ...matrix, b: 0 }, x, true, false));
                            if (y !== 0) {
                                result.push(TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SKEWY, { ...matrix, c: 0 }, y, false, true));
                            }
                        }
                    }
                }
                else if (method.startsWith('matrix')) {
                    const matrix = TRANSFORM.matrix(element, transform);
                    if (matrix) {
                        result.push(TRANSFORM.create(SVGTransform.SVG_TRANSFORM_MATRIX, matrix));
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
    matrix(element: SVGElement, value?: string): Null<SvgMatrix> {
        const match = REGEXP_TRANSFORM.MATRIX.exec(value || getAttribute(element, 'transform'));
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
        return null;
    },
    origin(element: SVGElement, value?: string) {
        if (!value) {
            value = getAttribute(element, 'transform-origin');
        }
        const result: Point = { x: 0, y: 0 };
        if (value) {
            const viewBox = getNearestViewBox(element);
            let width: Undef<number>,
                height: Undef<number>;
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
            RE_ROTATE.matcher(value);
            while (RE_ROTATE.find()) {
                const [angle, x, y] = RE_ROTATE.map(group => parseFloat(group) || 0, 1);
                if (angle !== 0) {
                    result.push({ angle, x, y });
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
    typeAsValue(type: NumString) {
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
    return result as DOMRect;
}

export function calculateStyle(element: SVGGraphicsElement, attr: string, value: string) {
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
    const viewBox = getNearestViewBox(element) || (element.viewportElement || element.parentElement || element).getBoundingClientRect();
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
            const result = calculateVar(element, value, { boundingSize: getViewportArea(viewBox, true), unitType: CSS_UNIT.DECIMAL });
            return !isNaN(result) ? result.toString() : '';
        }
        case 'strokeWidth': {
            const result = calculateVar(element, value, { boundingSize: getViewportArea(viewBox), unitType: CSS_UNIT.DECIMAL, min: 0 });
            return !isNaN(result) ? result.toString() : '';
        }
    }
    return '';
}

export function getAttribute(element: SVGElement, attr: string, computed?: boolean) {
    return (
        getStyleValue(element, convertCamelCase(attr)) ||
        getDataSetValue(element, attr) ||
        getNamedItem(element, attr) ||
        (computed || Array.from(element.style).includes(attr)) && getComputedStyle(element).getPropertyValue(attr) ||
        ''
    );
}

export function getParentAttribute(element: SVGElement, attr: string, computed?: boolean) {
    let current: Null<StyleElement> = element,
        value: string;
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

export function getTargetElement(element: Element, rootElement?: Null<Element>, contentMap?: Null<StringMap>) {
    const value = getNamedItem(element, 'href') || getNamedItem(element, 'xlink:href');
    if (value[0] === '#') {
        const id = value.substring(1);
        if (!rootElement) {
            let parent = element.parentElement;
            rootElement = parent;
            while (parent) {
                if (parent.parentElement instanceof HTMLElement) {
                    break;
                }
                else if (parent.parentElement) {
                    rootElement = parent;
                    parent = parent.parentElement;
                }
            }
        }
        if (rootElement) {
            const elements = rootElement.querySelectorAll('*');
            for (let i = 0, length = elements.length; i < length; ++i) {
                const target = elements.item(i);
                if (target.id.trim() === id && target instanceof SVGElement) {
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
        const [href, id] = splitPair(value, '#');
        if (href !== '') {
            const content = contentMap[resolvePath(href)];
            if (content) {
                document.body.insertAdjacentHTML('beforeend', content);
                element = document.body.lastElementChild as Element;
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

export function getNearestViewBox(element: SVGElement) {
    let current = element.parentElement;
    while (current) {
        if (SVG.svg(current) || SVG.symbol(current)) {
            const viewBox = current.viewBox;
            if (viewBox) {
                const baseVal = viewBox.baseVal;
                return baseVal && baseVal.width > 0 && baseVal.height > 0 ? baseVal : getDOMRect(current);
            }
        }
        current = current.parentElement;
    }
    return null;
}

export function getRootOffset(element: SVGGraphicsElement, rootElement: Element) {
    let x = 0,
        y = 0,
        parent = element.parentElement;
    while (parent && parent !== rootElement) {
        if (SVG.svg(parent) || SVG.use(parent)) {
            x += parent.x.baseVal.value;
            y += parent.y.baseVal.value;
        }
        parent = parent.parentElement;
    }
    return { x, y };
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