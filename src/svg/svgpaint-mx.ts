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

        public parentElement: SVGGraphicsElement | null = null;

        public setPaint() {
            this.setAttribute('color');
            this.setColor('fill');
            this.setAttribute('fill-opacity');
            this.setAttribute('fill-rule');
            this.setColor('stroke');
            this.setAttribute('stroke-opacity');
            this.setAttribute('stroke-width');
            this.setAttribute('stroke-linecap');
            this.setAttribute('stroke-linejoin');
            this.setAttribute('stroke-miterlimit');
            this.setAttribute('stroke-dasharray');
            this.setAttribute('stroke-dashoffset');
            const match = $util.REGEX_PATTERN.CSS_URL.exec(this.getAttribute('clip-path'));
            if (match) {
                this.clipPath = match[1];
            }
            this.setAttribute('clip-rule');
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

        private setAttribute(attr: string) {
            const value = this.getAttribute(attr);
            if (value !== '') {
                this[$util.convertCamelCase(attr)] = value;
            }
        }

        private getAttribute(attr: string) {
            return $dom.cssAttribute(this.element, attr) || (this.parentElement ? $dom.cssAttribute(this.parentElement, attr) : '');
        }
    };
};