import SvgBuild from './svgbuild';

import { REGEXP_SVG, getFontSize, getHostDPI } from './lib/util';

type SvgPattern = squared.svg.SvgPattern;
type SvgUse = squared.svg.SvgUse;
type SvgUseSymbol = squared.svg.SvgUseSymbol;

const $color = squared.lib.color;
const $dom = squared.lib.dom;
const $util = squared.lib.util;

const CLIPPATH_SHAPE: ObjectMap<RegExp> = {
    url: REGEXP_SVG.URL,
    inset: new RegExp(`inset\\(${REGEXP_SVG.LENGTH}\\s?${REGEXP_SVG.LENGTH}?\\s?${REGEXP_SVG.LENGTH}?\\s?${REGEXP_SVG.LENGTH}?\\)`),
    polygon: /polygon\(([^)]+)\)/,
    circle: new RegExp(`circle\\(${REGEXP_SVG.LENGTH}(?: at ${REGEXP_SVG.LENGTH} ${REGEXP_SVG.LENGTH})?\\)`),
    ellipse: new RegExp(`ellipse\\(${REGEXP_SVG.LENGTH} ${REGEXP_SVG.LENGTH}(?: at ${REGEXP_SVG.LENGTH} ${REGEXP_SVG.LENGTH})?\\)`),
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
        public strokeDashArray!: string;
        public strokeDashOffset!: string;
        public color!: string;
        public clipPath!: string;
        public clipRule!: string;

        public patternParent?: SvgPattern;
        public useParent?: SvgUse | SvgUseSymbol;

        public setPaint(d?: string[]) {
            this.resetPaint();
            this._setAttribute('color', true);
            this._setColor('fill');
            this._setAttribute('fill-opacity');
            this._setAttribute('fill-rule');
            this._setColor('stroke');
            this._setAttribute('stroke-opacity');
            this._setAttribute('stroke-width');
            this._setAttribute('stroke-linecap');
            this._setAttribute('stroke-linejoin');
            this._setAttribute('stroke-miterlimit');
            this._setAttribute('stroke-dasharray');
            this._setAttribute('stroke-dashoffset');
            this._setAttribute('clip-rule');
            const clipPath = this._getAttribute('clip-path', false, false);
            if (clipPath !== '') {
                for (const name in CLIPPATH_SHAPE) {
                    const match = CLIPPATH_SHAPE[name].exec(clipPath);
                    if (match) {
                        if (name === 'url') {
                            this.clipPath = match[1];
                            return;
                        }
                        else if (d && d.length) {
                            const dpi = getHostDPI();
                            const fontSize = getFontSize(this.element);
                            const boxRect = SvgBuild.toBoxRect(d);
                            const width = boxRect.right - boxRect.left;
                            const height = boxRect.bottom - boxRect.top;
                            const parent = this.parent;
                            function convertUnit(value: string, index: number) {
                                return $dom.convertClientUnit(value, index === 0 ? width : height, dpi, fontSize);
                            }
                            switch (name) {
                                case 'inset': {
                                    let x1 = 0;
                                    let x2 = 0;
                                    let y1 = convertUnit(match[1], 1);
                                    let y2 = 0;
                                    if (match[4]) {
                                        x1 = boxRect.left + convertUnit(match[4], 0);
                                        x2 = boxRect.right - convertUnit(match[2], 0);
                                        y2 = boxRect.bottom - convertUnit(match[3], 1);
                                    }
                                    else if (match[2]) {
                                        x1 = convertUnit(match[2], 0);
                                        x2 = boxRect.right - x1;
                                        y2 = boxRect.bottom - (match[3] ? convertUnit(match[3], 1) : y1);
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
                                    this.clipPath = SvgBuild.drawPolygon(points);
                                    return;
                                }
                                case 'polygon': {
                                    const points = match[1].split(',').map(values => {
                                        let [x, y] = values.trim().split(' ').map((value, index) => convertUnit(value, index));
                                        x += boxRect.left;
                                        y += boxRect.top;
                                        return <Point> { x, y };
                                    });
                                    if (parent) {
                                        parent.refitPoints(points);
                                    }
                                    this.clipPath = SvgBuild.drawPolygon(points);
                                    return;
                                }
                                default: {
                                    if (name === 'circle' || name === 'ellipse') {
                                        let rx: number;
                                        let ry: number;
                                        if (name === 'circle') {
                                            rx = convertUnit(match[1], width < height ? 0 : 1);
                                            ry = rx;
                                        }
                                        else  {
                                            rx = convertUnit(match[1], 0);
                                            ry = convertUnit(match[2], 1);
                                        }
                                        let cx = boxRect.left;
                                        let cy = boxRect.top;
                                        if (match.length >= 4) {
                                            const index = width < height ? 0 : 1;
                                            cx += convertUnit(match[match.length - 2], index);
                                            cy += convertUnit(match[match.length - 1], index);
                                        }
                                        if (parent) {
                                            cx = parent.refitX(cx);
                                            cy = parent.refitX(cy);
                                            rx = parent.refitSize(rx);
                                            ry = parent.refitSize(ry);
                                        }
                                        this.clipPath = SvgBuild.drawEllipse(cx, cy, rx, ry);
                                    }
                                    return;
                                }
                            }
                        }
                    }
                }
            }
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
            this.strokeDashArray = '';
            this.strokeDashOffset = '0';
            this.color = '';
            this.clipPath = '';
            this.clipRule = '';
        }

        private _setColor(attr: string) {
            const value = this._getAttribute(attr);
            const match = REGEXP_SVG.URL.exec(value);
            if (match) {
                this[`${attr}Pattern`] = match[1];
            }
            else if (value !== '') {
                let color: ColorData | undefined;
                switch (value.toLowerCase()) {
                    case 'none':
                    case 'transparent':
                    case 'rgba(0, 0, 0, 0)':
                        this[attr] = '';
                        break;
                    case 'currentcolor':
                        color = $color.parseRGBA(this.color || $dom.cssAttribute(this.element, attr, true));
                        break;
                    default:
                        color = $color.parseRGBA(value);
                        break;
                }
                if (color) {
                    this[attr] = color.valueRGB;
                }
            }
        }

        private _setAttribute(attr: string, computed = false) {
            const value = this._getAttribute(attr, computed);
            if (value !== '') {
                this[$util.convertCamelCase(attr)] = value;
            }
        }

        private _getAttribute(attr: string, computed = false, inherited = true) {
            let value = $dom.cssAttribute(this.element, attr, computed);
            if (inherited && value === '') {
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
                    current = current['parent'];
                }
            }
            return value;
        }
    };
};