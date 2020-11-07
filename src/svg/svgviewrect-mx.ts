import USER_AGENT = squared.lib.constant.USER_AGENT;

const { isUserAgent } = squared.lib.client;

function hasUnsupportedAccess(element: SVGElement) {
    if (element.tagName === 'svg') {
        if (isUserAgent(USER_AGENT.FIREFOX)) {
            return element.parentElement instanceof HTMLElement;
        }
        else if (isUserAgent(USER_AGENT.SAFARI)) {
            return !(element.parentElement instanceof HTMLElement);
        }
    }
    return false;
}

export default <T extends Constructor<squared.svg.SvgBaseVal>>(Base: T) => {
    return class extends Base implements squared.svg.SvgViewRect {
        public rectElement?: SvgRectElement;

        private _x = NaN;
        private _y = NaN;
        private _width = NaN;
        private _height = NaN;

        public setRect() {
            const parent = this.parent;
            let { x, y, width, height } = this;
            if (parent) {
                x = parent.refitX(x);
                y = parent.refitY(y);
                width = parent.refitSize(width);
                height = parent.refitSize(height);
            }
            this.setBaseValue('x', x);
            this.setBaseValue('y', y);
            this.setBaseValue('width', width);
            this.setBaseValue('height', height);
        }

        protected getRectElement() {
            const element = this.rectElement || this.element;
            switch (element.tagName) {
                case 'svg':
                case 'use':
                case 'image':
                    return element as SVGSVGElement;
                default:
                    return null;
            }
        }

        set x(value) {
            this._x = value;
        }
        get x() {
            return isNaN(this._x) ? this.getRectElement()?.x.baseVal.value || 0 : this._x;
        }

        set y(value) {
            this._y = value;
        }
        get y() {
            return isNaN(this._y) ? this.getRectElement()?.y.baseVal.value || 0 : this._y;
        }

        set width(value) {
            this._width = value;
        }
        get width() {
            if (isNaN(this._width)) {
                const element = this.getRectElement();
                return element ? hasUnsupportedAccess(element) ? element.getBoundingClientRect().width : element.width.baseVal.value : 0;
            }
            return this._width;
        }

        set height(value) {
            this._height = value;
        }
        get height() {
            if (isNaN(this._height)) {
                const element = this.getRectElement();
                return element ? hasUnsupportedAccess(element) ? element.getBoundingClientRect().height : element.height.baseVal.value : 0;
            }
            return this._height;
        }
    };
};