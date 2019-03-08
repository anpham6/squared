import SvgBuild from './svgbuild';

import { getAttributeUrl } from './lib/util';

type SvgShapePattern = squared.svg.SvgShapePattern;
type SvgUse = squared.svg.SvgUse;
type SvgUseSymbol = squared.svg.SvgUseSymbol;

const $color = squared.lib.color;
const $dom = squared.lib.dom;
const $util = squared.lib.util;

const REGEXP_CLIPPATH: ObjectMap<RegExp> = {
    url: $util.REGEXP_COMPILED.URL,
    inset: new RegExp(`inset\\(${$util.REGEXP_STRING.LENGTH}\\s?${$util.REGEXP_STRING.LENGTH}?\\s?${$util.REGEXP_STRING.LENGTH}?\\s?${$util.REGEXP_STRING.LENGTH}?\\)`),
    polygon: /polygon\(([^)]+)\)/,
    circle: new RegExp(`circle\\(${$util.REGEXP_STRING.LENGTH}(?: at ${$util.REGEXP_STRING.LENGTH} ${$util.REGEXP_STRING.LENGTH})?\\)`),
    ellipse: new RegExp(`ellipse\\(${$util.REGEXP_STRING.LENGTH} ${$util.REGEXP_STRING.LENGTH}(?: at ${$util.REGEXP_STRING.LENGTH} ${$util.REGEXP_STRING.LENGTH})?\\)`),
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
            this.setAttribute('color', true);
            this.setAttribute('fill');
            this.setAttribute('fill-opacity');
            this.setAttribute('fill-rule');
            this.setAttribute('stroke');
            this.setAttribute('stroke-opacity');
            this.setAttribute('stroke-width');
            this.setAttribute('stroke-linecap');
            this.setAttribute('stroke-linejoin');
            this.setAttribute('stroke-miterlimit');
            this.setAttribute('stroke-dasharray');
            this.setAttribute('stroke-dashoffset');
            this.setAttribute('clip-rule');
            const clipPath = this.getAttribute('clip-path', false, false);
            if (clipPath !== '') {
                for (const name in REGEXP_CLIPPATH) {
                    const match = REGEXP_CLIPPATH[name].exec(clipPath);
                    if (match) {
                        if (name === 'url') {
                            this.clipPath = match[1];
                            return;
                        }
                        else if (d && d.length) {
                            const fontSize = $dom.getFontSize(this.element);
                            const boxRect = SvgBuild.parseBoxRect(d);
                            const width = boxRect.right - boxRect.left;
                            const height = boxRect.bottom - boxRect.top;
                            const parent = this.parent;
                            function convertUnit(value: string, horizontal = true) {
                                return $util.convertUnit(value, horizontal ? width : height, fontSize);
                            }
                            switch (name) {
                                case 'inset': {
                                    let x1 = 0;
                                    let x2 = 0;
                                    let y1 = convertUnit(match[1], false);
                                    let y2 = 0;
                                    if (match[4]) {
                                        x1 = boxRect.left + convertUnit(match[4]);
                                        x2 = boxRect.right - convertUnit(match[2]);
                                        y2 = boxRect.bottom - convertUnit(match[3], false);
                                    }
                                    else if (match[2]) {
                                        x1 = convertUnit(match[2]);
                                        x2 = boxRect.right - x1;
                                        y2 = boxRect.bottom - (match[3] ? convertUnit(match[3], false) : y1);
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
                                    const points = $util.objectMap<string, Point>(match[1].split($util.REGEXP_COMPILED.SEPARATOR), values => {
                                        let [x, y] = $util.replaceMap<string, number>(values.trim().split(' '), (value, index) => convertUnit(value, index === 0));
                                        x += boxRect.left;
                                        y += boxRect.top;
                                        return <Point> { x, y };
                                    });
                                    if (parent) {
                                        parent.refitPoints(points);
                                    }
                                    this.clipPath = SvgBuild.drawPolygon(points, precision);
                                    return;
                                }
                                default: {
                                    if (name === 'circle' || name === 'ellipse') {
                                        let rx: number;
                                        let ry: number;
                                        if (name === 'circle') {
                                            rx = convertUnit(match[1], width < height);
                                            ry = rx;
                                        }
                                        else  {
                                            rx = convertUnit(match[1]);
                                            ry = convertUnit(match[2], false);
                                        }
                                        let cx = boxRect.left;
                                        let cy = boxRect.top;
                                        if (match.length >= 4) {
                                            const horizontal = width < height;
                                            cx += convertUnit(match[match.length - 2], horizontal);
                                            cy += convertUnit(match[match.length - 1], horizontal);
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

        public setAttribute(attr: string, computed = false) {
            let value = this.getAttribute(attr, computed);
            if ($util.isString(value)) {
                switch (attr) {
                    case 'stroke-dasharray':
                        value = $util.joinMap(value.split(/,\s*/), item => this.convertUnit(item), ', ');
                        break;
                    case 'stroke-dashoffset':
                    case 'stroke-width':
                        value = this.convertUnit(value);
                        break;
                    case 'fill':
                    case 'stroke':
                        const url = getAttributeUrl(value);
                        if (url !== '') {
                            this[`${attr}Pattern`] = url;
                        }
                        else {
                            let color: ColorData | undefined;
                            switch (value.toLowerCase()) {
                                case 'none':
                                case 'transparent':
                                case 'rgba(0, 0, 0, 0)':
                                    this[attr] = '';
                                    break;
                                case 'currentcolor':
                                    color = $color.parseColor(this.color || $dom.cssAttribute(this.element, attr, true));
                                    break;
                                default:
                                    color = $color.parseColor(value);
                                    break;
                            }
                            if (color) {
                                this[attr] = color.valueAsRGB;
                            }
                        }
                        return;
                }
                this[$util.convertCamelCase(attr)] = value;
            }
        }

        public getAttribute(attr: string, computed = false, inherited = true) {
            let value = $dom.cssAttribute(this.element, attr, computed);
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
                    value = $dom.cssAttribute(current.element, attr);
                    if ($util.isString(value)) {
                        break;
                    }
                    current = current.parent;
                }
            }
            return value;
        }

        public convertUnit(value: string) {
            if ($util.isUnit(value)) {
                return $util.convertUnit(value, 0, $dom.getFontSize(this.element)).toString();
            }
            else if ($util.isPercent(value)) {
                return $util.convertUnit(value, this.element.getBoundingClientRect().width).toString();
            }
            return value;
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