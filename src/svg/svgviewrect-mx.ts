const $dom = squared.lib.dom;

function hasUnsupportedAccess(element: SVGElement) {
    const domElement = element.parentElement instanceof HTMLElement;
    return element.tagName === 'svg' && (
        $dom.isUserAgent($dom.USER_AGENT.SAFARI) && !domElement ||
        $dom.isUserAgent($dom.USER_AGENT.FIREFOX) && domElement
    );
}

export default <T extends Constructor<squared.svg.SvgBaseVal>>(Base: T) => {
    return class extends Base implements squared.svg.SvgViewRect {
        private _x?: number;
        private _y?: number;
        private _width?: number;
        private _height?: number;

        public setRect() {
            let x = this.x;
            let y = this.y;
            let width = this.width;
            let height = this.height;
            const parent = this.parent;
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

        private getElement() {
            switch (this.element.tagName) {
                case 'svg':
                case 'use':
                case 'image':
                    return <SVGSVGElement> this.element;
                default:
                    return null;
            }
        }

        set x(value) {
            this._x = value;
        }
        get x() {
            if (this._x !== undefined) {
                return this._x;
            }
            else {
                const element = this.getElement();
                if (element) {
                    return element.x.baseVal.value;
                }
                return 0;
            }
        }

        set y(value) {
            this._y = value;
        }
        get y() {
            if (this._y !== undefined) {
                return this._y;
            }
            else {
                const element = this.getElement();
                if (element) {
                    return element.y.baseVal.value;
                }
                return 0;
            }
        }

        set width(value) {
            this._width = value;
        }
        get width() {
            if (this._width !== undefined) {
                return this._width;
            }
            else {
                const element = this.getElement();
                if (element) {
                    if (hasUnsupportedAccess(element)) {
                        return element.getBoundingClientRect().width;
                    }
                    else {
                        return element.width.baseVal.value;
                    }
                }
                return 0;
            }
        }

        set height(value) {
            this._height = value;
        }
        get height() {
            if (this._height !== undefined) {
                return this._height;
            }
            else {
                const element = this.getElement();
                if (element) {
                    if (hasUnsupportedAccess(element)) {
                        return element.getBoundingClientRect().height;
                    }
                    else {
                        return element.height.baseVal.value;
                    }
                }
                return 0;
            }
        }
    };
};