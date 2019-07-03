import { SvgPoint } from '../../@types/svg/object';

import SvgBuild from './svgbuild';

const $dom = squared.lib.dom;

function adjustPoints(values: SvgPoint[], x: number, y: number, scaleX: number, scaleY: number) {
    for (const pt of values) {
        pt.x += x;
        pt.y += y;
        if (pt.rx !== undefined && pt.ry !== undefined) {
            pt.rx *= scaleX;
            pt.ry *= scaleY;
        }
    }
}

export default <T extends Constructor<squared.svg.SvgElement>>(Base: T) => {
    return class extends Base implements squared.svg.SvgBaseVal {
        private _baseVal: ObjectMap<any> = {};

        public setBaseValue(attr: string, value?: any) {
            if (value !== undefined) {
                if (this.verifyBaseValue(attr, value)) {
                    this._baseVal[attr] = value;
                    return true;
                }
            }
            else {
                switch (attr) {
                    case 'd':
                        this._baseVal[attr] = $dom.getNamedItem(this.element, 'd');
                        return true;
                    case 'points':
                        const points: SVGPointList = this.element[attr];
                        if (Array.isArray(points)) {
                            this._baseVal[attr] = SvgBuild.clonePoints(points);
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

        public getBaseValue(attr: string, fallback?: any): any {
            return this._baseVal[attr] === undefined && !this.setBaseValue(attr) ? fallback : this._baseVal[attr];
        }

        public refitBaseValue(x: number, y: number, precision?: number, scaleX = 1, scaleY = 1) {
            for (const attr in this._baseVal) {
                const value = this._baseVal[attr];
                if (typeof value === 'string') {
                    if (attr === 'd') {
                        const commands = SvgBuild.getPathCommands(value);
                        const points = SvgBuild.getPathPoints(commands);
                        adjustPoints(points, x, y, scaleX, scaleY);
                        this._baseVal[attr] = SvgBuild.drawPath(SvgBuild.syncPathPoints(commands, points), precision);
                    }
                }
                else if (typeof value === 'number') {
                    switch (attr) {
                        case 'cx':
                        case 'x1':
                        case 'x2':
                        case 'x':
                            this._baseVal[attr] += x;
                            break;
                        case 'cy':
                        case 'y1':
                        case 'y2':
                        case 'y':
                            this._baseVal[attr] += y;
                            break;
                        case 'r':
                            this._baseVal[attr] *= Math.min(scaleX, scaleY);
                            break;
                        case 'rx':
                        case 'width':
                            this._baseVal[attr] *= scaleX;
                            break;
                        case 'ry':
                        case 'height':
                            this._baseVal[attr] *= scaleY;
                            break;
                    }
                }
                else if (Array.isArray(value)) {
                    if (attr === 'points') {
                        adjustPoints(value, x, y, scaleX, scaleY);
                    }
                }
            }
        }

        public verifyBaseValue(attr: string, value?: any) {
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
            return undefined;
        }
    };
};