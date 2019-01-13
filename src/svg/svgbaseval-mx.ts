import SvgBuild from './svgbuild';

const $dom = squared.lib.dom;

export default <T extends Constructor<squared.svg.SvgBase>>(Base: T) => {
    return class extends Base implements squared.svg.SvgBaseVal {
        private _baseVal: ObjectMap<any> = {};

        public setBaseValue(attr: string, value?: any) {
            if (value !== undefined) {
                if (this.validateType(attr, value)) {
                    this._baseVal[attr] = value;
                    return true;
                }
            }
            else {
                switch (attr) {
                    case 'd':
                        this._baseVal[attr] = $dom.cssAttribute(this.element, 'd');
                        return true;
                    case 'points':
                        const points: SVGPointList = this.element[attr];
                        if (Array.isArray(points)) {
                            this._baseVal[attr] = SvgBuild.toPointList(points);
                            return true;
                        }
                        break;
                    default:
                        const object: SVGAnimatedLength = this.element[attr];
                        if (object && object.baseVal) {
                            this._baseVal[attr] = object.baseVal.value;
                            return true;
                        }
                        break;
                }
            }
            return false;
        }

        public getBaseValue(attr: string, defaultValue?: any): any {
            return this._baseVal[attr] === undefined && !this.setBaseValue(attr) ? defaultValue : this._baseVal[attr];
        }

        private validateType(attr: string, value: any) {
            switch (attr) {
                case 'd':
                    return typeof value === 'string';
                case 'cx':
                case 'cy':
                case 'r':
                case 'rx':
                case 'ry':
                case 'x1':
                case 'x2':
                case 'y1':
                case 'y2':
                case 'x':
                case 'y':
                case 'width':
                case 'height':
                    return typeof value === 'number';
                case 'points':
                    return Array.isArray(value);
            }
            return false;
        }
    };
};