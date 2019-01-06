import { SvgRectBaseValue } from './@types/object';

export default <T extends Constructor<squared.svg.SvgView>>(Base: T) => {
    return class extends Base implements squared.svg.SvgViewRect {
        public baseValue!: SvgRectBaseValue;

        public setRect() {
            this.baseValue = Object.assign(this.baseValue || {}, {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height,
                transformed: null
            });
        }

        private getElement() {
            return this.element instanceof SVGSVGElement || this.element instanceof SVGUseElement || this.element instanceof SVGImageElement ? this.element : undefined;
        }

        set x(value) {
            const element = this.getElement();
            if (element) {
                element.x.baseVal.value = value;
            }
        }
        get x() {
            const element = this.getElement();
            if (element) {
                return element.x.baseVal.value;
            }
            return 0;
        }

        set y(value) {
            const element = this.getElement();
            if (element) {
                element.y.baseVal.value = value;
            }
        }
        get y() {
            const element = this.getElement();
            if (element) {
                return element.y.baseVal.value;
            }
            return 0;
        }

        set width(value) {
            const element = this.getElement();
            if (element) {
                element.width.baseVal.value = value;
            }
        }
        get width() {
            const element = this.getElement();
            if (element) {
                return element.width.baseVal.value;
            }
            return 0;
        }

        set height(value) {
            const element = this.getElement();
            if (element) {
                element.height.baseVal.value = value;
            }
        }
        get height() {
            const element = this.getElement();
            if (element) {
                return element.height.baseVal.value;
            }
            return 0;
        }
    };
};