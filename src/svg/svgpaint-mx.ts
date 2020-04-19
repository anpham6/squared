import SvgBuild from './svgbuild';

import { calculateStyle, getAttribute } from './lib/util';

type SvgElement = squared.svg.SvgElement;
type SvgShapePattern = squared.svg.SvgShapePattern;
type SvgUse = squared.svg.SvgUse;
type SvgUseSymbol = squared.svg.SvgUseSymbol;

const $lib = squared.lib;

const { parseColor } = $lib.color;
const { extractURL, getFontSize, hasCalc, isCustomProperty, isLength, isPercent, parseUnit, parseVar } = $lib.css;
const { truncate } = $lib.math;
const { STRING, XML } = $lib.regex;
const { convertCamelCase, convertFloat, isNumber, isString, joinArray, objectMap } = $lib.util;

const PERCENTAGE = STRING.LENGTH_PERCENTAGE;
const REGEX_CACHE: ObjectMap<RegExp> = {
    polygon: /polygon\(([^)]+)\)/,
    inset: new RegExp(`inset\\(${PERCENTAGE}\\s?${PERCENTAGE}?\\s?${PERCENTAGE}?\\s?${PERCENTAGE}?\\)`),
    circle: new RegExp(`circle\\(${PERCENTAGE}(?:\\s+at\\s+${PERCENTAGE}\\s+${PERCENTAGE})?\\)`),
    ellipse: new RegExp(`ellipse\\(${PERCENTAGE}\\s+${PERCENTAGE}(?:\\s+at\\s+${PERCENTAGE}\\s+${PERCENTAGE})?\\)`)
};

export default <T extends Constructor<SvgElement>>(Base: T) => {
    return class extends Base implements squared.svg.SvgPaint {
        public fill!: string;
        public fillPattern!: string;
        public fillOpacity!: string;
        public fillRule!: string;
        public stroke!: string;
        public strokePattern!: string;
        public strokeOpacity!: string;
        public strokeLinecap!: string;
        public strokeLinejoin!: string;
        public strokeMiterlimit!: string;
        public strokeDasharray!: string;
        public strokeDashoffset!: string;
        public color!: string;
        public clipPath!: string;
        public clipRule!: string;
        public patternParent?: SvgShapePattern;
        public useParent?: SvgUse | SvgUseSymbol;

        protected _retainStyle = true;

        private _strokeWidth = '1';

        public setStroke() {
            this.setAttribute('stroke');
            this.setAttribute('stroke-width');
        }

        public setPaint(d?: string[], precision?: number) {
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
            const clipPath = this.getAttribute('clip-path', true);
            if (clipPath !== '' && clipPath !== 'none') {
                const url = extractURL(clipPath);
                if (url !== '') {
                    this.clipPath = url;
                }
                else if (d?.length) {
                    for (const name in REGEX_CACHE) {
                        const match = REGEX_CACHE[name].exec(clipPath);
                        if (match) {
                            const { top, right, bottom, left } = SvgBuild.getBoxRect(d);
                            const width = right - left;
                            const height = bottom - top;
                            switch (name) {
                                case 'inset': {
                                    let x1 = 0, y1 = this.convertLength(match[1], height);
                                    let x2 = 0, y2 = 0;
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
                                    this.parent?.refitPoints(points);
                                    this.clipPath = SvgBuild.drawPolygon(points, precision);
                                    break;
                                }
                                case 'polygon': {
                                    const points = objectMap(match[1].split(XML.SEPARATOR), values => {
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
                                    this.parent?.refitPoints(points);
                                    this.clipPath = SvgBuild.drawPolygon(points, precision);
                                    break;
                                }
                                default:
                                    if (name === 'circle' || name === 'ellipse') {
                                        const parent = this.parent;
                                        const dimension = width < height ? width : height;
                                        let rx: number;
                                        let ry: number;
                                        if (name === 'circle') {
                                            rx = this.convertLength(match[1], dimension);
                                            ry = rx;
                                        }
                                        else {
                                            rx = this.convertLength(match[1], width);
                                            ry = this.convertLength(match[2], height);
                                        }
                                        let cx = left;
                                        let cy = top;
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

        public setAttribute(attr: string, computed = false, inherited = true) {
            let value = this.getAttribute(attr, computed, inherited);
            attr = convertCamelCase(attr);
            if (isString(value)) {
                if (hasCalc(value)) {
                    value = calculateStyle(this.element, attr, value) || getComputedStyle(this.element)[attr];
                }
                else if (isCustomProperty(value)) {
                    value = parseVar(this.element, value) || getComputedStyle(this.element)[attr];
                }
                switch (attr) {
                    case 'strokeDasharray':
                        value = value !== 'none' ? joinArray(value.split(/,\s*/), unit => this.convertLength(unit).toString(), ', ', false) : '';
                        break;
                    case 'strokeDashoffset':
                    case 'strokeWidth':
                        value = this.convertLength(value).toString();
                        break;
                    case 'fill':
                    case 'stroke': {
                        const url = extractURL(value);
                        if (url !== '') {
                            this[attr + 'Pattern'] = url;
                        }
                        else {
                            let color: Undef<ColorData>;
                            switch (value) {
                                case 'none':
                                case 'transparent':
                                case 'rgba(0, 0, 0, 0)':
                                    this[attr] = 'none';
                                    break;
                                case 'currentcolor':
                                case 'currentColor':
                                    color = parseColor(this.color || getAttribute(this.element, 'color', true));
                                    break;
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
            else if (!this._retainStyle) {
                this[attr] = '';
            }
        }

        public getAttribute(attr: string, computed = false, inherited = true) {
            let value = getAttribute(this.element, attr, computed);
            if (inherited && !isString(value)) {
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
                    if (isString(value)) {
                        break;
                    }
                    current = current.parent;
                }
            }
            return value;
        }

        public convertLength(value: string, dimension?: string | number) {
            if (!isNumber(value)) {
                if (isLength(value)) {
                    return parseUnit(value, getFontSize(this.element));
                }
                else if (isPercent(value)) {
                    return Math.round((typeof dimension === 'number' ? dimension : this.element.getBoundingClientRect()[dimension || 'width']) * parseFloat(value) / 100);
                }
            }
            return convertFloat(value);
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
            if (isString(stroke) && stroke !== 'none') {
                const result = this._strokeWidth;
                if (result !== '') {
                    const parent = this.parent;
                    return parent?.requireRefit ? truncate(parent.refitSize(parseFloat(result))) : result;
                }
            }
            return '';
        }
    };
};