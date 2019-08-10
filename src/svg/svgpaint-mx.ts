import SvgBuild from './svgbuild';

import { getAttribute, getAttributeURL } from './lib/util';

type SvgShapePattern = squared.svg.SvgShapePattern;
type SvgUse = squared.svg.SvgUse;
type SvgUseSymbol = squared.svg.SvgUseSymbol;

const {
    color: $color,
    css: $css,
    regex: $regex,
    util: $util
} = squared.lib;

const CACHE_PATTERN: ObjectMap<RegExp> = {
    url: $regex.CSS.URL
};

export default <T extends Constructor<squared.svg.SvgElement>>(Base: T) => {
    return class extends Base implements squared.svg.SvgPaint {
        public fill!: string;
        public fillPattern!: string;
        public fillOpacity!: string;
        public fillRule!: string;
        public stroke!: string;
        public strokeWidth!: string;
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

        public setPaint(d?: string[], precision?: number) {
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
                if (CACHE_PATTERN.polygon === undefined) {
                    CACHE_PATTERN.polygon = /polygon\(([^)]+)\)/;
                    CACHE_PATTERN.inset = new RegExp(`inset\\(${$regex.STRING.LENGTH_PERCENTAGE}\\s?${$regex.STRING.LENGTH_PERCENTAGE}?\\s?${$regex.STRING.LENGTH_PERCENTAGE}?\\s?${$regex.STRING.LENGTH_PERCENTAGE}?\\)`);
                    CACHE_PATTERN.circle = new RegExp(`circle\\(${$regex.STRING.LENGTH_PERCENTAGE}(?: at ${$regex.STRING.LENGTH_PERCENTAGE} ${$regex.STRING.LENGTH_PERCENTAGE})?\\)`);
                    CACHE_PATTERN.ellipse = new RegExp(`ellipse\\(${$regex.STRING.LENGTH_PERCENTAGE} ${$regex.STRING.LENGTH_PERCENTAGE}(?: at ${$regex.STRING.LENGTH_PERCENTAGE} ${$regex.STRING.LENGTH_PERCENTAGE})?\\)`);
                }
                for (const name in CACHE_PATTERN) {
                    const match = CACHE_PATTERN[name].exec(clipPath);
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
                                    return;
                                }
                                case 'polygon': {
                                    const points = $util.objectMap<string, Point>(match[1].split($regex.XML.SEPARATOR), values => {
                                        let [x, y] = $util.replaceMap<string, number>(values.trim().split(' '), (value, index) => this.convertLength(value, index === 0 ? width : height));
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

        public setAttribute(attr: string, computed = true, inherited = true) {
            let value = this.getAttribute(attr, computed, inherited);
            if ($util.isString(value)) {
                if ($css.isCustomProperty(value)) {
                    const result = $css.calculateVar(this.element, value, attr);
                    if (result !== undefined) {
                        value = result.toString();
                    }
                }
                switch (attr) {
                    case 'stroke-dasharray':
                        value = value !== 'none' ? $util.joinMap(value.split(/,\s*/), unit => this.convertLength(unit).toString(), ', ', false) : '';
                        break;
                    case 'stroke-dashoffset':
                    case 'stroke-width':
                        value = this.convertLength(value).toString();
                        break;
                    case 'fill':
                    case 'stroke':
                        const url = getAttributeURL(value);
                        if (url !== '') {
                            this[attr + 'Pattern'] = url;
                        }
                        else {
                            let color: ColorData | undefined;
                            switch (value.toLowerCase()) {
                                case 'none':
                                case 'transparent':
                                case 'rgba(0, 0, 0, 0)':
                                    this[attr] = 'none';
                                    break;
                                case 'currentcolor':
                                    color = $color.parseColor(this.color || getAttribute(this.element, attr));
                                    break;
                                default:
                                    color = $color.parseColor(value);
                                    break;
                            }
                            if (color) {
                                this[attr] = color.value;
                            }
                        }
                        return;
                }
                this[$util.convertCamelCase(attr)] = value;
            }
        }

        public getAttribute(attr: string, computed = true, inherited = true) {
            let value = getAttribute(this.element, attr, computed);
            if (inherited && !$util.isString(value)) {
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
                    if ($util.isString(value)) {
                        break;
                    }
                    current = current.parent;
                }
            }
            return value;
        }

        public convertLength(value: string, dimension?: string | number) {
            if (!$util.isNumber(value)) {
                if ($css.isLength(value)) {
                    return $css.parseUnit(value, $css.getFontSize(this.element));
                }
                else if ($css.isPercent(value)) {
                    return Math.round((typeof dimension === 'number' ? dimension : this.element.getBoundingClientRect()[dimension || 'width']) * $util.convertFloat(value) / 100);
                }
            }
            return $util.convertFloat(value);
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
    };
};