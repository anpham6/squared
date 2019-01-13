const $dom = squared.lib.dom;

export default <T extends Constructor<squared.svg.SvgBaseVal>>(Base: T) => {
    return class extends Base implements squared.svg.SvgViewRect {
        private _width: number | undefined;
        private _height: number | undefined;

        public setRect() {
            let x = this.x;
            let y = this.y;
            let width = this.width;
            let height = this.height;
            if (this.parent) {
                x = this.parent.recalibrateX(x);
                y = this.parent.recalibrateX(y);
                width = this.parent.recalibrateDimension(width);
                height = this.parent.recalibrateDimension(height);
            }
            this.setBaseValue('x', x);
            this.setBaseValue('y', y);
            this.setBaseValue('width', width);
            this.setBaseValue('height', height);
        }

        private getElement() {
            const tagName = this.element.tagName;
            return tagName === 'svg' || tagName === 'use' || tagName === 'image' ? <SVGSVGElement> this.element : null;
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
                if (element.tagName === 'svg' && $dom.isUserAgent($dom.USER_AGENT.FIREFOX)) {
                    this._width = value;
                }
                else {
                    element.width.baseVal.value = value;
                }
            }
        }
        get width() {
            const element = this.getElement();
            if (element) {
                if (element.tagName === 'svg' && $dom.isUserAgent($dom.USER_AGENT.FIREFOX)) {
                    if (this._width !== undefined) {
                        return this._width;
                    }
                    else {
                        const bounds = element.getBoundingClientRect();
                        return bounds.width;
                    }
                }
                else {
                    return element.width.baseVal.value;
                }
            }
            return 0;
        }

        set height(value) {
            const element = this.getElement();
            if (element) {
                if (element.tagName === 'svg' && $dom.isUserAgent($dom.USER_AGENT.FIREFOX)) {
                    this._height = value;
                }
                else {
                    element.height.baseVal.value = value;
                }
            }
        }
        get height() {
            const element = this.getElement();
            if (element) {
                if (element.tagName === 'svg' && $dom.isUserAgent($dom.USER_AGENT.FIREFOX)) {
                    if (this._height !== undefined) {
                        return this._height;
                    }
                    else {
                        const bounds = element.getBoundingClientRect();
                        return bounds.height;
                    }
                }
                else {
                    return element.height.baseVal.value;
                }
            }
            return 0;
        }
    };
};