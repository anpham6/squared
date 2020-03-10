const { USER_AGENT, isUserAgent } = squared.lib.client;

type SvgBaseVal = squared.svg.SvgBaseVal;

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

export default <T extends Constructor<SvgBaseVal>>(Base: T) => {
    return class extends Base implements squared.svg.SvgViewRect {
        #x?: number;
        #y?: number;
        #width?: number;
        #height?: number;

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

        private _getElement() {
            const element = this.element;
            switch (element.tagName) {
                case 'svg':
                case 'use':
                case 'image':
                    return <SVGSVGElement> element;
                default:
                    return null;
            }
        }

        set x(value) {
            this.#x = value;
        }
        get x() {
            return this.#x ?? (this._getElement()?.x.baseVal.value || 0);
        }

        set y(value) {
            this.#y = value;
        }
        get y() {
            return this.#y ?? (this._getElement()?.y.baseVal.value || 0);
        }

        set width(value) {
            this.#width = value;
        }
        get width() {
            const result = this.#width;
            if (result !== undefined) {
                return result;
            }
            else {
                const element = this._getElement();
                if (element) {
                    return hasUnsupportedAccess(element) ? element.getBoundingClientRect().width : element.width.baseVal.value;
                }
                return 0;
            }
        }

        set height(value) {
            this.#height = value;
        }
        get height() {
            const result = this.#height;
            if (result !== undefined) {
                return result;
            }
            else {
                const element = this._getElement();
                if (element) {
                    return hasUnsupportedAccess(element) ? element.getBoundingClientRect().height : element.height.baseVal.value;
                }
                return 0;
            }
        }
    };
};