import type SvgElement from './svgelement';

import SvgBuild from './svgbuild';

import { calculateStyle, getAttribute } from './lib/util';

type SvgShapePattern = squared.svg.SvgShapePattern;
type SvgUse = squared.svg.SvgUse;

const { STRING } = squared.lib.regex;

const { parseColor } = squared.lib.color;
const { asPercent, checkStyleValue, extractURL, getFontSize, getStyle, hasCalc, hasEm, hasCustomProperty, isLength, parseUnit, parseVar } = squared.lib.css;
const { truncate } = squared.lib.math;
const { convertCamelCase, splitSome } = squared.lib.util;

const REGEXP_CACHE: ObjectMap<RegExp> = {
    polygon: /polygon\(([^)]+)\)/,
    inset: new RegExp(`inset\\(${STRING.LENGTH_PERCENTAGE}\\s?${STRING.LENGTH_PERCENTAGE}?\\s?${STRING.LENGTH_PERCENTAGE}?\\s?${STRING.LENGTH_PERCENTAGE}?\\)`),
    circle: new RegExp(`circle\\(${STRING.LENGTH_PERCENTAGE}(?:\\s+at\\s+${STRING.LENGTH_PERCENTAGE}\\s+${STRING.LENGTH_PERCENTAGE})?\\)`),
    ellipse: new RegExp(`ellipse\\(${STRING.LENGTH_PERCENTAGE}\\s+${STRING.LENGTH_PERCENTAGE}(?:\\s+at\\s+${STRING.LENGTH_PERCENTAGE}\\s+${STRING.LENGTH_PERCENTAGE})?\\)`)
};

export default <T extends Constructor<SvgElement>>(Base: T) => {
    return class extends Base implements squared.svg.SvgPaint {
        public fill = '';
        public fillPattern = '';
        public fillOpacity = '';
        public fillRule = '';
        public stroke = '';
        public strokePattern = '';
        public strokeOpacity = '';
        public strokeLinecap = '';
        public strokeLinejoin = '';
        public strokeMiterlimit = '';
        public strokeDasharray = '';
        public strokeDashoffset = '';
        public color = '';
        public clipPath = '';
        public clipRule = '';
        public useParent: Null<SvgUse> = null;
        public patternParent: Null<SvgShapePattern> = null;

        private _strokeWidth = '';

        public setStroke() {
            this.setAttribute('stroke');
            this.setAttribute('stroke-width');
        }

        public setPaint(d?: Null<string[]>, precision?: number) {
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
                        const match = REGEXP_CACHE[name]!.exec(clipPath);
                        if (match) {
                            const { top, right, bottom, left } = SvgBuild.boxRectOf(d);
                            const width = right - left;
                            const height = bottom - top;
                            const parent = this.parent;
                            switch (name) {
                                case 'inset': {
                                    let x1 = 0,
                                        y1 = this.convertLength(match[1], height),
                                        x2 = 0,
                                        y2 = 0;
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
                                    const points: Point[] = [
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
                                    const points: Point[] = [];
                                    splitSome(match[1], values => {
                                        let x = left,
                                            y = top;
                                        values.split(/\s+/).forEach((value, index) => {
                                            if (index === 0) {
                                                x += this.convertLength(value, width);
                                            }
                                            else {
                                                y += this.convertLength(value, height);
                                            }
                                        });
                                        points.push({ x, y });
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
                                        let rx: number,
                                            ry: number;
                                        if (name === 'circle') {
                                            rx = this.convertLength(match[1], dimension);
                                            ry = rx;
                                        }
                                        else {
                                            rx = this.convertLength(match[1], width);
                                            ry = this.convertLength(match[2], height);
                                        }
                                        let cx = left,
                                            cy = top;
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

        public setAttribute(attr: string) {
            const element = this.element;
            let value = this.getAttribute(attr);
            if (value) {
                attr = convertCamelCase(attr);
                if (hasCalc(value)) {
                    value = calculateStyle(element, attr, value) || getStyle(element)[attr];
                }
                else if (hasCustomProperty(value)) {
                    value = parseVar(element, value) || getStyle(element)[attr];
                }
                else {
                    value = checkStyleValue(element, attr, value);
                }
                switch (attr) {
                    case 'strokeDasharray':
                        if (value !== 'none') {
                            let revised = '';
                            splitSome(value, unit => {
                                revised += (revised ? ', ' : '') + this.convertLength(unit);
                            });
                            value = revised;
                        }
                        else {
                            return;
                        }
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
                            let color: Null<ColorData>;
                            switch (value = value.toLowerCase()) {
                                case 'none':
                                case 'transparent':
                                case 'rgba(0, 0, 0, 0)':
                                    this[attr] = 'none';
                                    return;
                                case 'currentcolor':
                                    value = this.color || getAttribute(this.parent && SvgBuild.asUseSymbol(this.parent) ? this.parent.element : element, 'color', true);
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

        public getAttribute(attr: string) {
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

        public convertLength(value: string, dimension?: NumString) {
            let n = +value;
            if (!isNaN(n)) {
                return n;
            }
            if (isLength(value)) {
                return parseUnit(value, hasEm(value) ? { fontSize: getFontSize(this.element) } : undefined);
            }
            return !isNaN(n = asPercent(value)) ? Math.round((typeof dimension === 'number' ? dimension : this.element.getBoundingClientRect()[dimension || 'width']) * n) : 0;
        }

        public resetPaint() {
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
            const stroke = this.stroke;
            if (stroke && stroke !== 'none') {
                const result = this._strokeWidth;
                if (result) {
                    return this.parent?.requireRefit ? truncate(this.parent.refitSize(+result)) : result;
                }
            }
            return '';
        }
    };
};