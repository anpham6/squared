const $color = squared.lib.color;
const $dom = squared.lib.dom;
const $util = squared.lib.util;

export default <T extends Constructor<squared.svg.SvgView>>(Base: T) => {
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
        public opacity = '1';
        public clipPath = '';
        public clipRule = '';

        public setPaint() {
            const element = this.element;
            const opacity = $dom.cssAttribute(element, 'opacity');
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
            const match = $util.REGEX_PATTERN.CSS_URL.exec($dom.cssAttribute(element, 'clip-path'));
            this.clipPath = match ? match[1] : '';
            this.clipRule = $dom.cssAttribute(element, 'clip-rule');
        }

        private setColor(attr: string) {
            const element = this.element;
            let value: string | null = $dom.cssAttribute(element, attr);
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
                if (element.parentElement instanceof SVGGElement) {
                    value = $dom.cssAttribute(element.parentElement, attr);
                }
                if (value === '' && attr === 'fill') {
                    value = null;
                }
            }
            if (value !== null) {
                this[attr] = value;
            }
        }

        private setOpacity(attr: string) {
            const opacity = $dom.cssAttribute(this.element, `${attr}-opacity`);
            this[`${attr}Opacity`] = opacity ? (parseFloat(opacity) * parseFloat(this.opacity)).toString() : this.opacity;
        }

        private setAttribute(attr: string) {
            const element = this.element;
            let value = $dom.cssAttribute(element, attr);
            if (value === '' && element.parentElement instanceof SVGGElement) {
                value = $dom.cssAttribute(element.parentElement, attr);
            }
            if (value !== '') {
                this[$util.convertCamelCase(attr)] = value;
            }
        }
    };
};