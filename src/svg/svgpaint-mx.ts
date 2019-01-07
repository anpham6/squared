import { setOpacity } from './lib/util';

const $color = squared.lib.color;
const $dom = squared.lib.dom;
const $util = squared.lib.util;

export default <T extends Constructor<squared.svg.SvgBase>>(Base: T) => {
    return class extends Base implements squared.svg.SvgPaint {
        public fill = 'black';
        public fillPattern = '';
        public fillOpacity = '1';
        public fillRule = 'nonzero';
        public stroke = '';
        public strokeWidth = '1';
        public strokePattern = '';
        public strokeOpacity = '1';
        public strokeLinecap = 'butt';
        public strokeLinejoin = 'miter';
        public strokeMiterlimit = '4';
        public strokeDashArray = '';
        public strokeDashOffset = '0';
        public color = '';
        public clipPath = '';
        public clipRule = '';

        public readonly parentElement?: SVGGraphicsElement;

        public setPaint() {
            const opacity = this.getAttribute('opacity');
            if (opacity !== '') {
                this.opacity = Math.min(parseFloat(opacity), 1).toString();
            }
            this.setAttribute('color');
            this.setColor('fill');
            this.setOpacity('fill');
            this.setAttribute('fill-rule');
            this.setColor('stroke');
            this.setOpacity('stroke');
            this.setAttribute('stroke-width');
            this.setAttribute('stroke-linecap');
            this.setAttribute('stroke-linejoin');
            this.setAttribute('stroke-miterlimit');
            this.setAttribute('stroke-dasharray');
            this.setAttribute('stroke-dashoffset');
            const match = $util.REGEX_PATTERN.CSS_URL.exec(this.getAttribute('clip-path'));
            this.clipPath = match ? match[1] : '';
            this.clipRule = this.getAttribute('clip-rule');
        }

        private setColor(attr: string) {
            const element = this.element;
            let value: string | null = this.getAttribute(attr);
            const match = $util.REGEX_PATTERN.CSS_URL.exec(value);
            if (match) {
                this[`${attr}Pattern`] = match[1];
                value = '';
            }
            else if (value !== '') {
                switch (value.toLowerCase()) {
                    case 'none':
                    case 'transparent':
                    case 'rgba(0, 0, 0, 0)':
                        value = '';
                        break;
                    case 'currentcolor': {
                        const color = $color.parseRGBA(this.color || $dom.cssAttribute(element, attr, true));
                        value = color ? color.valueRGB : null;
                        break;
                    }
                    default: {
                        const color = $color.parseRGBA(value);
                        if (color) {
                            value = color.valueRGB;
                        }
                        break;
                    }
                }
            }
            else {
                if (attr === 'fill') {
                    value = null;
                }
            }
            if (value !== null) {
                this[attr] = value;
            }
        }

        set opacity(value) {
            setOpacity(this.element, value);
        }
        get opacity() {
            return $dom.cssAttribute(this.element, 'opacity') || '1';
        }

        private setOpacity(attr: string) {
            const opacity = this.getAttribute(`${attr}-opacity`);
            this[`${attr}Opacity`] = opacity ? (parseFloat(opacity) * parseFloat(this.opacity)).toString() : this.opacity;
        }

        private getAttribute(attr: string) {
            return $dom.cssAttribute(this.element, attr) || (this.parentElement ? $dom.cssAttribute(this.parentElement, attr) : '');
        }

        private setAttribute(attr: string) {
            const value = this.getAttribute(attr);
            if (value !== '') {
                this[$util.convertCamelCase(attr)] = value;
            }
        }
    };
};